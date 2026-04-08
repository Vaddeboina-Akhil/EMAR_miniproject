import React from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const AddRecord = () => {
  return (
    <Card title="Add New Medical Record" className="max-w-2xl">
      <form className="space-y-6">
        <div>
          <Input label="Patient ID" placeholder="Enter Aadhaar/Patient ID" />
        </div>
        <div>
          <Input label="Record Type" as="select">
            <option>Prescription</option>
            <option>Lab Results</option>
            <option>Imaging</option>
            <option>Discharge Summary</option>
          </Input>
        </div>
        <div>
          <Input 
            label="Upload File" 
            type="file" 
            accept=".pdf,.jpg,.png"
          />
        </div>
        <Input 
          label="Description/Notes" 
          as="textarea" 
          rows={4}
          placeholder="Enter details about this medical record..."
        />
        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
            Save Record to Blockchain
          </Button>
          <Button type="button" variant="secondary" className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddRecord;
