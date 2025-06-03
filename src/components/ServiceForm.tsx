import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TranslationForm from './TranslationForm';
import api from '@api/axios';
import { Description, ServiceResponse, Translation } from '../types/ServiceResponse';

const ServiceForm: React.FC = () => {
   const location = useLocation();
   const [services, setServices] = useState<ServiceResponse[]>({} as ServiceResponse[]);
   const [selectedServices, setSelectedServices] = useState<ServiceResponse>();
   const [serviceIdSelected, setServiceIdSelected] = useState<string>();
   const [serviceSelected, setServiceSelected] = useState<ServiceResponse>({} as ServiceResponse);
   const [formData, setFormData] = useState<Translation[]>([]);

   const [branchId, setBranchId] = useState<string>('');
   const [branches, setBranches] = useState<any[]>([]);

   const [langId, setLangId] = useState<string>('');
   const [languages, setLanguages] = useState<any[]>([]);

   const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBranchId(e.target.value);
   };


   const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLangId(e.target.value);
   };


   useEffect(() => {
      const fetchLanguages = async () => {
         try {
            const res = await api.get('/languages');
            setLanguages(res.data.data);
         } catch (error) {
            console.error('Failed to fetch languages:', error);
         }
      };
      fetchLanguages();
   }, []);


   useEffect(() => {
      const fetchBranches = async () => {
         try {
            const response = await api.get('/branchs?lang=vi');
            setBranches(response.data.data);
         } catch (error) {
            console.error('Failed to fetch branches:', error);
         }
      };
      fetchBranches();
   }, []);





   useEffect(() => {
      const fetchAllServices = async () => {
         try {
            const response = await api.get(`/services/service-details?lang=${langId}&branchId=${branchId}`);
            setServices(response.data);
         } catch (error) {
            console.error('Failed to fetch services:', error);
         }
      };

      if (branchId && langId) {
         fetchAllServices();
      }

   }, [branchId, langId]);

   useEffect(() => {
      if (services && services.length > 0) {
         const serviceAndTrans: ServiceResponse = services.find(s => s._id === serviceIdSelected) || {} as ServiceResponse;
         if (serviceAndTrans) {
            const trans: Translation[] = serviceAndTrans.translations;
            const newTrans: Translation[] = trans && trans.length > 0 && trans.map(t => ({ ...t, serviceDescriptions: t.serviceDescriptions && t.serviceDescriptions || [] as Description[] })) || [] as Translation[]
            if (trans) {
               setFormData(newTrans)
            }
         }
      }
   }, [serviceIdSelected])


   // Sync formData with serviceSelected.translations
   useEffect(() => {
      if (serviceSelected && serviceSelected.translations) {
         setFormData(serviceSelected.translations.map((tran: any) => ({
            ...tran,
            descriptions: tran.descriptions ? [...tran.descriptions] : [],
         })));
      }
   }, [serviceSelected]);


   // Handle input change for translation fields
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, tranIndex: number) => {
      const { name, value } = e.target;
      setFormData((prev) =>
         prev.map((tran, idx) =>
            idx === tranIndex ? { ...tran, [name]: value } : tran
         )
      );
   };


   // Handle description change
   const handleDescriptionChange = (tranIndex: number, descIndex: number, field: keyof Description, value: string) => {
      setFormData((prev) =>
         prev.map((tran, idx) =>
            idx === tranIndex
               ? {
                  ...tran,
                  serviceDescriptions: tran.serviceDescriptions.map((desc: Description, dIdx: number) =>
                     dIdx === descIndex ? { ...desc, [field]: value } : desc
                  ),
               }
               : tran
         )
      );
   };


   // Add description
   const addDescription = (tranIndex: number) => {
      setFormData((prev) =>
         prev.map((tran, idx) =>
            idx === tranIndex
               ? {
                  ...tran,
                  serviceDescriptions: [
                     ...(tran.serviceDescriptions || []),
                     { type: '', content: '' },
                  ],
               }
               : tran
         )
      );
   };


   // Remove description
   const removeDescription = (tranIndex: number, descIndex: number) => {
      setFormData((prev) =>
         prev.map((tran, idx) =>
            idx === tranIndex
               ? {
                  ...tran,
                  serviceDescriptions: tran.serviceDescriptions.filter((_: any, i: number) => i !== descIndex),
               }
               : tran
         )
      );
   };


   const handleSubmit = async (e: React.FormEvent, tran: Translation) => {
      e.preventDefault();
      try {
         const { createdAt, _id, __v, language, serviceId, ...rest } = tran;
         console.log("service Trans ID:", tran._id);
         console.log("service Trans:", tran);
         await api.patch(`/service-details/${tran._id}`, rest);
         window.location.reload()
      } catch (error) {
         console.error('Error submitting service:', error);
         alert('Failed to update service.');
      }
   };

   return (
      <>
         <h1>Services</h1>
         <div style={{ display: 'flex', gap: "24px" }}>
            <select
               name="langId"
               id="langId"
               value={langId}
               onChange={handleLangChange}
               style={{
                  marginBottom: '16px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  background: '#fafbfc',
                  fontSize: '16px',
                  color: '#222',
                  outline: 'none',
                  marginRight: '16px',
                  minWidth: '220px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
               }}
            >
               <option value="">-- select language --</option>
               {languages && languages.length > 0 && languages.map(lang => (
                  <option key={lang._id} value={lang._id}>
                     {lang.languageName || lang.languageName}
                  </option>
               ))}
            </select>
            <select
               name="branchId"
               id="branchId"
               value={branchId}
               onChange={handleBranchChange}
               style={{
                  marginBottom: '16px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  background: '#fafbfc',
                  fontSize: '16px',
                  color: '#222',
                  outline: 'none',
                  marginRight: '16px',
                  minWidth: '220px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
               }}
            >
               <option value="">-- select branch --</option>
               {branches && branches.length > 0 && branches.map(branch => (
                  <option key={branch._id} value={branch._id}>
                     {branch.branchName || branch.name}
                  </option>
               ))}
            </select>
         </div>

         {
            langId
            && branchId
            && <div>
               <select
                  name="serviceId"
                  id="serviceId"
                  onChange={(e) => setServiceIdSelected(e.target.value)}
                  style={{
                     padding: '10px',
                     borderRadius: '6px',
                     border: '1px solid #ccc',
                     background: '#fafbfc',
                     fontSize: '16px',
                     color: '#222',
                     outline: 'none',
                     minWidth: '220px',
                     boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}
               >
                  <option value="">-- select service --</option>
                  {
                     services
                     && services?.length > 0
                     && services.map(svc => (
                        <option key={svc._id} value={svc._id}>
                           {`${svc.serviceName}`}
                        </option>
                     ))
                  }
               </select>
            </div>
         }

         {
            langId
            && branchId
            && serviceIdSelected
            &&
            (
               < div style={{
                  display: "flex",
                  gap: '24px'
               }}>
                  {formData.map((tran, tranIndex) => (
                     <form
                        id={tran._id}
                        key={tranIndex}
                        onSubmit={(e) => handleSubmit(e, tran)}
                        style={{
                           maxWidth: '500px',
                           margin: '40px auto',
                           padding: '32px',
                           border: '1px solid #ddd',
                           borderRadius: '10px',
                           background: '#fafbfc',
                           boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '18px',
                        }}
                     >
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#222' }}>
                           Service Name:
                           <input
                              type="text"
                              name="serviceName"
                              value={tran.serviceName}
                              onChange={(e) => handleInputChange(e, tranIndex)}
                              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                           />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#222' }}>
                           Service Sub Name:
                           <input
                              type="text"
                              name="serviceSubName"
                              value={tran.serviceSubName}
                              onChange={(e) => handleInputChange(e, tranIndex)}
                              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                           />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#222' }}>
                           Default Service Price:
                           <input
                              type="number"
                              name="defaultServicePrice"
                              value={tran.defaultServicePrice}
                              onChange={(e) => handleInputChange(e, tranIndex)}
                              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                           />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#222' }}>
                           Service Image URL:
                           <input
                              type="text"
                              name="serviceImage"
                              value={tran.serviceImage}
                              onChange={(e) => handleInputChange(e, tranIndex)}
                              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                           />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#222' }}>
                           Service Description:
                           <textarea
                              name="serviceDescription"
                              value={tran.serviceDescription}
                              onChange={(e) => handleInputChange(e, tranIndex)}
                              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
                           />
                        </label>

                        <h3 style={{ margin: '16px 0 0 0', color: 'black' }}>Descriptions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid black', padding: '5px' }}>
                           {
                              tran
                              && tran.serviceDescriptions
                              && tran.serviceDescriptions.length > 0
                              && tran.serviceDescriptions.map((description: Description, descIndex: number) => (
                                 <div
                                    key={descIndex}
                                    style={{
                                       display: 'flex',
                                       border: '1px solid #e0e0e0',
                                       borderRadius: '6px',
                                       padding: '14px',
                                       background: '#fff',
                                       flexDirection: 'row',
                                       gap: '10px',
                                    }}
                                 >
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#222' }}>
                                       Type:
                                       <select
                                          value={description.type}
                                          onChange={(e) => handleDescriptionChange(tranIndex, descIndex, 'type', e.target.value)}
                                          style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc' }}
                                       >
                                          <option value="">Select type</option>
                                          <option value="p">Paragraph</option>
                                          <option value="italic">Italic</option>
                                          <option value="bold">Bold</option>
                                       </select>
                                    </label>

                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#222' }}>
                                       Content:
                                       <textarea
                                          value={description.content}
                                          onChange={(e) => handleDescriptionChange(tranIndex, descIndex, 'content', e.target.value)}
                                          style={{ padding: '7px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '40px' }}
                                       />
                                    </label>

                                    <button
                                       type="button"
                                       onClick={() => removeDescription(tranIndex, descIndex)}
                                       style={{
                                          alignSelf: 'flex-end',
                                          background: '#f44336',
                                          color: '#fff',
                                          border: 'none',
                                          borderRadius: '4px',
                                          padding: '6px 14px',
                                          cursor: 'pointer',
                                       }}
                                    >
                                       Delete
                                    </button>
                                 </div>
                              ))}
                        </div>

                        <button
                           type="button"
                           onClick={() => addDescription(tranIndex)}
                           style={{
                              background: '#1976d2',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '8px 18px',
                              cursor: 'pointer',
                              marginTop: '4px',
                              width: 'fit-content',
                              alignSelf: 'flex-start',
                           }}
                        >
                           Add Description
                        </button>

                        <button
                           type="submit"
                           style={{
                              background: '#388e3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '10px 0',
                              fontWeight: 'bold',
                              fontSize: '16px',
                              marginTop: '12px',
                              cursor: 'pointer',
                           }}
                        >
                           Submit
                        </button>
                     </form>
                  ))}
               </div >
            )
         }
      </>
   );
};

export default ServiceForm;
