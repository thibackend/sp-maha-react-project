import React, { useState } from 'react';

interface Description {
   type: string;
   content: string;
}

interface Translation {
   _id: string;
   serviceId: string;
   serviceName: string;
   serviceSubName: string;
   defaultServicePrice: number;
   serviceImage: string;
   serviceImages: string[];
   serviceDescription: string;
   language: string;
   descriptions: Description[];
}

interface Props {
   translations: Translation[];
   onSubmit: (updatedTranslations: Translation[]) => void;
}

const TranslationForm: React.FC<Props> = ({ translations, onSubmit }) => {
   const [formTranslations, setFormTranslations] = useState<Translation[]>(translations);

   const handleTranslationChange = (index: number, field: keyof Translation, value: any) => {
      const updatedTranslations = [...formTranslations];
      (updatedTranslations[index] as any)[field] = value;
      setFormTranslations(updatedTranslations);
   };

   const handleDescriptionChange = (
      translationIndex: number,
      descriptionIndex: number,
      field: keyof Description,
      value: string
   ) => {
      const updatedTranslations = [...formTranslations];
      const updatedDescriptions = [...updatedTranslations[translationIndex].descriptions];
      updatedDescriptions[descriptionIndex][field] = value;
      updatedTranslations[translationIndex].descriptions = updatedDescriptions;
      setFormTranslations(updatedTranslations);
   };

   const addDescription = (translationIndex: number) => {
      const updatedTranslations = [...formTranslations];
      updatedTranslations[translationIndex].descriptions.push({ type: '', content: '' });
      setFormTranslations(updatedTranslations);
   };

   const removeDescription = (translationIndex: number, descriptionIndex: number) => {
      const updatedTranslations = [...formTranslations];
      updatedTranslations[translationIndex].descriptions = updatedTranslations[
         translationIndex
      ].descriptions.filter((_, i) => i !== descriptionIndex);
      setFormTranslations(updatedTranslations);
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formTranslations);
   };

   return (
      <form onSubmit={handleSubmit}>
         {formTranslations.map((translation, translationIndex) => (
            <div key={translation._id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
               <h3>Translation ({translation.language})</h3>

               <label>
                  Service Name:
                  <input
                     type="text"
                     value={translation.serviceName}
                     onChange={(e) => handleTranslationChange(translationIndex, 'serviceName', e.target.value)}
                  />
               </label>

               <label>
                  Service Sub Name:
                  <input
                     type="text"
                     value={translation.serviceSubName}
                     onChange={(e) => handleTranslationChange(translationIndex, 'serviceSubName', e.target.value)}
                  />
               </label>

               <label>
                  Default Service Price:
                  <input
                     type="number"
                     value={translation.defaultServicePrice}
                     onChange={(e) => handleTranslationChange(translationIndex, 'defaultServicePrice', e.target.value)}
                  />
               </label>

               <label>
                  Service Description:
                  <textarea
                     value={translation.serviceDescription}
                     onChange={(e) => handleTranslationChange(translationIndex, 'serviceDescription', e.target.value)}
                  />
               </label>

               <h4>Descriptions</h4>
               {translation.descriptions.map((description, descriptionIndex) => (
                  <div key={descriptionIndex} style={{ marginBottom: '10px' }}>
                     <label>
                        Type:
                        <input
                           type="text"
                           value={description.type}
                           onChange={(e) =>
                              handleDescriptionChange(translationIndex, descriptionIndex, 'type', e.target.value)
                           }
                        />
                     </label>

                     <label>
                        Content:
                        <textarea
                           value={description.content}
                           onChange={(e) =>
                              handleDescriptionChange(translationIndex, descriptionIndex, 'content', e.target.value)
                           }
                        />
                     </label>

                     <button type="button" onClick={() => removeDescription(translationIndex, descriptionIndex)}>
                        Remove Description
                     </button>
                  </div>
               ))}

               <button type="button" onClick={() => addDescription(translationIndex)}>
                  Add Description
               </button>
            </div>
         ))}

         <button type="submit">Submit</button>
      </form>
   );
};

export default TranslationForm;
