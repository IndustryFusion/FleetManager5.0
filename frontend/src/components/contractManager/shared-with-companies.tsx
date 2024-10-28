import React from 'react'

interface Company {
    _id: string;
    provider_company_name: string;
}

interface SharedWithCompaniesProps {
    sharedCompanies: Company[];
}

const SharedWithCompanies:React.FC<SharedWithCompaniesProps> = ({sharedCompanies}) => {
    // Create a unique list of companies based on provider_company_name
    const uniqueCompanies = Array.from(
        new Map(
          sharedCompanies.map((company) => [company.provider_company_name, company])
        ).values()
      ).slice(0, 2);

  return (
     <div className="flex mt-3">
      {uniqueCompanies.map((company: any, index: number) => {
        const initials = company.provider_company_name
          .slice(0, 2)
          .toUpperCase(); 

        return (
          <div key={company._id} className={`share-content user-${index + 1}`}>
            {initials}
          </div>
        );
      })}
    </div>
  )
}

export default SharedWithCompanies;