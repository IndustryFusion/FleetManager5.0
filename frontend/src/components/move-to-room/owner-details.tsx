import React from 'react';
import { Card } from 'primereact/card';
import "../../../public/styles/owner-card.css";

interface OwnerDetailsCardProps {
  owner: {
    name: string;
    companyIfricId: string;
    certifiedCompany: string;
    role: string;
    country: string;
  } | null;
}

const OwnerDetailsCard: React.FC<OwnerDetailsCardProps> = ({ owner }) => {
  if (!owner) {
    return null;
  }

  return (
    <Card title="" className="owner-details-card">
      <div className="card-title">Owner Details</div>
      <div className="p-fluid">
        <div className="field">
          <span className="label">Company Name:</span>
          {owner.name}
        </div>
        <div className="field">
          <span className="label">Company IFRIC:</span>
          {owner.companyIfricId}
        </div>
        <div className="field">
          <span className="label">IFRIC Certified :</span>
          {owner.certifiedCompany}
        </div>
        <div className="field">
          <span className="label">Role:</span>
          {owner.role}
        </div>
        <div className="field">
          <span className="label">Country:</span>
          {owner.country}
        </div>
      </div>
    </Card>
  );
};

export default OwnerDetailsCard;