import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

// Define types
interface Branch {
  _id: string;
  branchAddress: string;
}

interface ServiceType {
  _id: string;
  serviceTypeName: string;
}

interface ServiceOption {
  id: string;
  serviceOptionName: string;
  serviceOptionDuration: string;
  serviceOptionPrice: string;
}

interface ServiceDetail {
  id: string;
  serviceName: string;
  serviceSubName: string;
  serviceImage: string;
  serviceImages: string[];
  serviceDescription: string;
  defaultServicePrice: string;
  servicePrice: string;
  servicePriceDiscount: string;
  servicePriceDiscountPercent: string;
  language: string;
  options: ServiceOption[];
}

interface FormData {
  branchId: string;
  serviceTypeId: string;
  serviceDetails: ServiceDetail[];
}

// Assume api is imported or globally available
declare const api: any;

export default function ServiceManagement() {
  const [formData, setFormData] = useState<FormData>({
    branchId: '',
    serviceTypeId: '',
    serviceDetails: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const handleChangeRoot = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addServiceDetail = () => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: [
        ...prev.serviceDetails,
        {
          id: uuidv4(),
          serviceName: '',
          serviceSubName: '',
          serviceImage: '',
          serviceImages: [],
          serviceDescription: '',
          defaultServicePrice: '',
          servicePrice: '',
          servicePriceDiscount: '',
          servicePriceDiscountPercent: '',
          language: '',
          options: [],
        }
      ]
    }));
  };

  const removeServiceDetail = (id: string) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: prev.serviceDetails.filter(d => d.id !== id)
    }));
  };

  const handleChangeDetail = (id: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      serviceDetails: prev.serviceDetails.map(d =>
        d.id === id ? { ...d, [name]: value } : d
      )
    }));
  };

  const addOption = (detailId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: prev.serviceDetails.map(d => {
        if (d.id !== detailId) return d;
        return {
          ...d,
          options: [
            ...d.options,
            { id: uuidv4(), serviceOptionName: '', serviceOptionDuration: '', serviceOptionPrice: '' }
          ]
        };
      })
    }));
  };

  const removeOption = (detailId: string, optionId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: prev.serviceDetails.map(d => {
        if (d.id !== detailId) return d;
        return {
          ...d,
          options: d.options.filter(o => o.id !== optionId)
        };
      })
    }));
  };

  const handleChangeOption = (
    detailId: string,
    optionId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      serviceDetails: prev.serviceDetails.map(d => {
        if (d.id !== detailId) return d;
        return {
          ...d,
          options: d.options.map(o =>
            o.id === optionId ? { ...o, [name]: value } : o
          )
        };
      })
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      const output = {
        branchId: formData.branchId,
        serviceTypeId: formData.serviceTypeId,
        serviceDetails: formData.serviceDetails.map(d => {
          const { id, ...rest } = d;
          return {
            ...rest,
            defaultServicePrice: rest.defaultServicePrice ? Number(rest.defaultServicePrice) : undefined,
            servicePrice: rest.servicePrice ? Number(rest.servicePrice) : undefined,
            servicePriceDiscount: rest.servicePriceDiscount ? Number(rest.servicePriceDiscount) : undefined,
            servicePriceDiscountPercent: rest.servicePriceDiscountPercent ? Number(rest.servicePriceDiscountPercent) : undefined,
            options: rest.options.map(o => {
              const { id: oid, ...opts } = o;
              return {
                ...opts,
                serviceOptionDuration: opts.serviceOptionDuration ? Number(opts.serviceOptionDuration) : undefined,
                serviceOptionPrice: opts.serviceOptionPrice ? Number(opts.serviceOptionPrice) : undefined,
              };
            })
          };
        })
      };

      console.log(JSON.stringify(output, null, 2));
      const createService = await api.post('/services/new', output);
      const wait = await Swal.fire({
        title: "Create service successfully!",
        showCancelButton: true,
      });
      if (wait) location.reload();

    } catch (error) {
      console.error('Submit error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
        showCancelButton: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("formdata", formData)
  }, [formData]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [branchRes, serviceTypeRes] = await Promise.all([
          api.get('/branchs'),
          api.get('/service-types')
        ]);

        setBranches(branchRes.data.data);
        setServiceTypes(serviceTypeRes.data);
      } catch (err) {
        console.error('Lỗi khi fetch dữ liệu select:', err);
      }
    };

    fetchOptions();
  }, []);

  return (
    <div style={{ padding: "20px", width: "600px" }}>
      <h2>Service Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Branch:</label><br />
          <select name="branchId" value={formData.branchId} onChange={handleChangeRoot} style={{ width: '100%' }} required>
            <option value="">-- Chọn chi nhánh --</option>
            {branches && branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.branchAddress}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Service Type:</label><br />
          <select name="serviceTypeId" value={formData.serviceTypeId} onChange={handleChangeRoot} style={{ width: '100%' }} required>
            <option value="">-- Chọn loại dịch vụ --</option>
            {serviceTypes && serviceTypes.map((s) => (
              <option key={s._id} value={s._id}>
                {s.serviceTypeName}
              </option>
            ))}
          </select>
        </div>

        <hr />
        <h3>Thêm các ngôn ngữ</h3>
        {formData.serviceDetails.map((detail, di) => (
          <React.Fragment key={detail.id}>
            <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 20 }}>
              <button type="button" onClick={() => removeServiceDetail(detail.id)} style={{ float: 'right' }}>Xóa <span style={{ textTransform: "uppercase", color: di === 0 ? 'yellow' : di === 1 ? 'blue' : 'white' }}>{di === 0 ? 'Việt nam' : di === 1 ? 'English' : ''}</span></button>
              <div>
                <label>Language:</label><br />
                <select name="language" defaultValue={(di === 0 ? 'vi' : di === 1 ? 'en' : '')} value={detail.language} onChange={e => handleChangeDetail(detail.id, e)} required>
                  <option value="">-- Select language --</option>
                  <option value="vi">Vietnamese (vi)</option>
                  <option value="en">English (en)</option>
                </select>
              </div>

              <div>
                <label>serviceName:</label><br />
                <input name="serviceName" value={detail.serviceName} onChange={e => handleChangeDetail(detail.id, e)} required style={{ width: '100%' }} />
              </div>
              <div>
                <label>serviceDescription:</label><br />
                <textarea name="serviceDescription" value={detail.serviceDescription} onChange={e => handleChangeDetail(detail.id, e)} required style={{ width: '100%' }} />
              </div>

              <div style={{ marginTop: 10, paddingLeft: 10, borderLeft: '3px solid #888' }}>
                <h4>Options</h4>
                {detail.options.map(opt => (
                  <div key={opt.id} style={{ marginBottom: 20, display: 'flex', flexDirection: 'row' }}>
                    <button type="button" onClick={() => removeOption(detail.id, opt.id)} style={{ marginRight: 5 }}>❌</button>
                    <input
                      placeholder="Name"
                      name="serviceOptionName"
                      value={opt.serviceOptionName}
                      onChange={e => handleChangeOption(detail.id, opt.id, e)}
                      required
                      style={{ width: '100%' }}
                    />
                    <input
                      placeholder="Duration"
                      type='number'
                      name="serviceOptionDuration"
                      style={{ marginLeft: 5, width: '50%' }}
                      value={opt.serviceOptionDuration}
                      onChange={e => handleChangeOption(detail.id, opt.id, e)}
                      required
                    />
                    <input
                      type='number'
                      placeholder="Price"
                      name="serviceOptionPrice"
                      style={{ width: '30%', marginLeft: 5, }}
                      value={opt.serviceOptionPrice}
                      onChange={e => handleChangeOption(detail.id, opt.id, e)}
                      required
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addOption(detail.id)}>+ Thêm Option</button>
              </div>
              <div>
                <label>serviceImage URL:</label><br />
                <input name="serviceImage" value={detail.serviceImage} onChange={e => handleChangeDetail(detail.id, e)} required style={{ width: '100%' }} />
              </div>
              <div>
                <label>defaultServicePrice:</label><br />
                <input type='number' name="defaultServicePrice" value={detail.defaultServicePrice} onChange={e => handleChangeDetail(detail.id, e)} required style={{ width: '50%' }} />
              </div>

              <div>
                <label>serviceSubName:</label><br />
                <input name="serviceSubName" value={detail.serviceSubName} onChange={e => handleChangeDetail(detail.id, e)} style={{ width: '100%' }} />
              </div>

            </div>
            <div style={{ width: '100%', height: "2px", border: "2px dashed blue", marginBottom: 20 }}></div>
          </React.Fragment>
        ))}

        <button type="button" onClick={addServiceDetail}>+ Thêm ngôn ngữ</button>
        <hr />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Submit'}
        </button>
      </form>
      {isLoading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, color: '#fff', fontSize: 24
        }}>
          Đang xử lý...
        </div>
      )}
    </div>
  );
}
