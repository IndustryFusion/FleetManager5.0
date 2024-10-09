import React, { useState } from 'react';
import { Card } from 'primereact/card';
import "../../../public/styles/owner-card.css";

interface OwnerDetailsCardProps {
  owner: {
    name: string;
    companyIfricId: string;
    company_category: string;
  } | null;
}
type ExpandValue = {
  [key: string]: boolean;
};

const OwnerDetailsCard: React.FC<OwnerDetailsCardProps> = ({ owner }) => {
  const [expandValue, setExpandValue] = useState<ExpandValue>({});
  if (!owner) {
    return null;
  }

  const toggleExpansion = (key: string) => {
    setExpandValue((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };
  const key = expandValue[owner.companyIfricId] || false;

  return (
    <Card title="" className="owner-details-card">
      <div className="form_group_title">Owner Details</div>
      <div className="owner_details_group">
        <div className="field">
          <div className="owner_details_label">Company Name</div>
          <div className="owner_details_value">{owner.name} </div>
        </div>
        <div className="field">
          <div className="owner_details_label">Company IFRIC ID</div>
          <div className="owner_details_value flex align-items-center ">
          <p className={key ? "expand-id-text m-0" : "owner-company-id m-0" }>{owner.companyIfricId}</p>
          <button
            onClick={() => toggleExpansion(owner.companyIfricId)}
            className="transparent-btn"
          >
            <i className="pi pi-angle-down"></i>
          </button>
          </div>
        </div>
        <div className="field">
          <div className="owner_details_label">Company Category</div>
          <div className="owner_details_value">{owner.company_category}</div>
        </div>
      </div>
    </Card>
  );
};

export default OwnerDetailsCard;