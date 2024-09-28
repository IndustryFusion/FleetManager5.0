import React from 'react';
import { Card } from 'primereact/card';
import "../../../public/styles/owner-card.css";

interface OwnerDetailsCardProps {
  owner: {
    name: string;
    companyIfricId: string;
    company_category: string;
  } | null;
}

const OwnerDetailsCard: React.FC<OwnerDetailsCardProps> = ({ owner }) => {
  if (!owner) {
    return null;
  }

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
          <div className="owner_details_value">{owner.companyIfricId}</div>
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