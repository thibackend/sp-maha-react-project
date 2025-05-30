import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from './api/axios';

export default function App() {
  const [formData, setFormData] = useState({
    branchId: '',
    serviceTypeId: '',
    serviceDetails: [],
  });

  const [isLoading, setIsLoading] = useState(false);


  const [branches, setBranches] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);

  const handleChangeRoot = (e) => {
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

  const removeServiceDetail = (id) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: prev.serviceDetails.filter(d => d.id !== id)
    }));
  };

  const handleChangeDetail = (id, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      serviceDetails: prev.serviceDetails.map(d =>
        d.id === id ? { ...d, [name]: value } : d
      )
    }));
  };

  const addOption = (detailId) => {
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

  const removeOption = (detailId, optionId) => {
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

  const handleChangeOption = (detailId, optionId, e) => {
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

  const handleSubmit = async (e) => {
    setIsLoading(true); // ✅ Bắt đầu loading
    e.preventDefault();
    try {
      const output = {
        branchId: formData.branchId,
        serviceTypeId: formData.serviceTypeId,
        serviceDetails: formData.serviceDetails.map(d => {
          const { id, ...rest } = d;
          // chuyển các giá trị số về number
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
      console.log(createService);
      if (confirm("Create service successfully!")) {

        if (formData.length > 0) {
          const serviceDetails = formData.serviceDetails.map(d => {
            const { id, ...rest } = d;
            return {
              ...rest,
              defaultServicePrice: 0,
              options: rest.options.map(o => {
                return {
                  serviceOptionName: "",
                  serviceOptionDuration: "",
                  serviceOptionPrice: "",
                };
              })
            };
          })

          setFormData(pre => ({
            ...pre,
            serviceDetails: serviceDetails
          }));
        }

      }
      // window.location.reload();

    } catch (error) {
      console.error('Submit error:', error);
      alert('Đã xảy ra lỗi khi submit!');
    } finally {
      setIsLoading(false); // ✅ Kết thúc loading
    }
  };

  useEffect(() => {
    // Fetch branch & serviceType data
    const fetchOptions = async () => {
      try {
        const [branchRes, serviceTypeRes] = await Promise.all([
          api.get('/branchs'),
          api.get('/service-types')
        ]);

        console.log("serviceTypeRes:", serviceTypeRes.data)
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
          <select name="branchId" value={formData.branchId} onChange={handleChangeRoot} style={{ width: '100%' }}>
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
          <select name="serviceTypeId" value={formData.serviceTypeId} onChange={handleChangeRoot} style={{ width: '100%' }}>
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
          <>
            <div key={detail.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 20 }}>
              <button type="button" onClick={() => removeServiceDetail(detail.id)} style={{ float: 'right' }}>Xóa Detail</button>
              <div>
                <label>Language:</label><br />
                <select name="language" value={detail.language} onChange={e => handleChangeDetail(detail.id, e)} required>
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
                      style={{ width: 60, marginLeft: 5, width: '50%' }}
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
            <div style={{width:'100%', height:"2px", border:"2px dashed blue",marginBottom:20}}></div>
          </>
        ))}

        <button type="button" onClick={addServiceDetail}>+ Thêm Service Detail</button>
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
