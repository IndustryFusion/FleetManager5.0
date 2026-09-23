//
// Copyright (c) 2024 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { getCompanyDetailsById } from "@/utility/auth";
import { getAssignedContracts } from "@/utility/contracts";
import "../../../public/styles/confirm-dialog.css";
import "../../../public/styles/move-to-room.css";
import "../../../public/styles/ownership-data.css";

interface OwnershipDataDialogProps {
  visible: boolean;
  // A table row: the product's fields plus its owner's company details
  // (company_ifric_id, company_name, company_image, city, country, ...).
  asset: any;
  // The logged-in company, which manufactured the product.
  manufacturerIfricId: string;
  onHide: () => void;
}

const hasText = (value?: string) => !!value && value.trim() !== "" && value !== "NULL";

// Same logo / initial-circle as the transfer confirmation dialog.
const renderLogo = (logo?: string, name?: string) =>
  hasText(logo) ? (
    <img
      src={logo}
      alt={`${name || "Company"} logo`}
      className="group-logo"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  ) : (
    <div className="no-product-img">{name ? name[0].toUpperCase() : "?"}</div>
  );

// Categories are stored as machine_builder / factory_owner; show them as words.
const prettyCategory = (value?: string) =>
  hasText(value)
    ? value!
        .replace(/[_-]+/g, " ")
        .trim()
        .replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    : undefined;

const place = (city?: string, country?: string) =>
  [city, country].filter(hasText).join(", ") || "-";

// Company fields arrive under two namings: the registry returns a company's own
// record as address_1/city/country, and the company_address/company_city/
// company_country aliases in the owner list IFX copies onto each product.
// company_category is derived, so it only comes with a company profile.
const company = (...sources: any[]) => {
  const pick = (...keys: string[]) => {
    for (const source of sources) {
      for (const key of keys) {
        if (source && hasText(source[key])) return source[key] as string;
      }
    }
    return undefined;
  };
  return {
    name: pick("company_name"),
    image: pick("company_image"),
    address: pick("company_address", "address_1"),
    city: pick("company_city", "city"),
    country: pick("company_country", "country"),
    category: pick("company_category", "industry"),
    ifricId: pick("company_ifric_id"),
  };
};

// A long id, shortened with an expand toggle, as in the owner details card.
const IdValue: React.FC<{ value?: string }> = ({ value }) => {
  const [expanded, setExpanded] = useState(false);
  if (!hasText(value)) return <div className="owner_details_value">-</div>;
  return (
    <div className="owner_details_value ownership-data-id">
      <p className={expanded ? "expanded" : "collapsed"} title={value}>
        {value}
      </p>
      <button className="transparent-btn" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Collapse" : "Expand"}>
        <i className={`pi ${expanded ? "pi-angle-up" : "pi-angle-down"}`}></i>
      </button>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="field m-0">
    <div className="owner_details_label">{label}</div>
    {children}
  </div>
);

// Read-only view of who owns a product that was transferred to another company.
export default function OwnershipDataDialog({ visible, asset, manufacturerIfricId, onHide }: OwnershipDataDialogProps) {
  const [manufacturerData, setManufacturerData] = useState<any>(null);
  // The product row carries the owner's name, image and address, but not its
  // category, so the owner's company profile is loaded as well.
  const [ownerData, setOwnerData] = useState<any>(null);
  const [contracts, setContracts] = useState<string[] | null>(null);

  useEffect(() => {
    if (!visible || !asset) return;
    setManufacturerData(null);
    setOwnerData(null);
    setContracts(null);
    getCompanyDetailsById(manufacturerIfricId)
      .then((response) => setManufacturerData(response?.data?.[0] ?? null))
      .catch((error) => console.error("Error fetching manufacturer details:", error));
    getCompanyDetailsById(asset.company_ifric_id)
      .then((response) => setOwnerData(response?.data?.[0] ?? null))
      .catch((error) => console.error("Error fetching owner details:", error));
    getAssignedContracts(asset.company_ifric_id, manufacturerIfricId, asset.id)
      .then((response) => setContracts(Array.isArray(response?.data) ? response.data.map((c: any) => c.contract_name) : []))
      .catch((error) => {
        console.error("Error fetching assigned contracts:", error);
        setContracts([]);
      });
  }, [visible, asset, manufacturerIfricId]);

  const manufacturer = company(manufacturerData);
  const owner = company(ownerData, asset);

  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button className="global-button is-white" style={{ height: "30px" }} onClick={onHide}>
        <img src="/cancel-circle.svg" alt="" />
        Close
      </button>
    </div>
  );

  return (
    <Dialog
      header="Ownership Data"
      visible={visible}
      style={{ width: "42vw", borderRadius: "10px" }}
      breakpoints={{ "1200px": "60vw", "960px": "80vw", "641px": "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="confirm-transfer-dialog ownership-data-dialog"
      footer={footer}
    >
      <div className="confirm-dialog-container">
        <div className="confirm-dialog-content">
          <div className="confirm-heaader-title">
            This PDT Asset is owned by{" "}
            <strong className="blue">{owner.name || "another company"}</strong>. It is in their{" "}
            <strong className="blue">IFX Eco-System</strong> — in{" "}
            <strong className="blue">Factory Manager & Fleet Manager</strong>.
          </div>

          <div className="counter-parties-container">
            <div className="contract-parties w-full">
              <h3 className="contract-parties-header">Contract Parties</h3>
              <div className="parties-container">
                <div className="party-card">
                  <div className="group-info">
                    {renderLogo(manufacturer.image, manufacturer.name)}
                    <div className="group-text">
                      <span className="ownership-data-role">Manufacturer</span>
                      <div className="group-name">{manufacturer.name || "-"}</div>
                      <div className="signed-contracts">{place(manufacturer.city, manufacturer.country)}</div>
                    </div>
                  </div>
                </div>
                <div className="transfer-arrow">
                  <img src="/Arrow 2.svg" alt="" />
                </div>
                <div className="party-card outlined">
                  <div className="group-info">
                    {renderLogo(owner.image, owner.name)}
                    <div className="group-text">
                      <span className="ownership-data-role">Owner</span>
                      <div className="group-name">{owner.name || "-"}</div>
                      <div className="signed-contracts">{place(owner.city, owner.country)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ownership-data-details">
            <div className="party-card">
              <div className="w-full">
                <div className="form_group_title">Owner Details</div>
                <div className="owner_details_group">
                  <Field label="Company Name"><div className="owner_details_value">{owner.name || "-"}</div></Field>
                  <Field label="Company IFRIC ID"><IdValue value={owner.ifricId} /></Field>
                  <Field label="Company Category"><div className="owner_details_value">{prettyCategory(owner.category) || "-"}</div></Field>
                  <Field label="Address"><div className="owner_details_value">{[owner.address, place(owner.city, owner.country)].filter((v) => v && v !== "-").join(", ") || "-"}</div></Field>
                </div>
              </div>
            </div>
            <div className="party-card">
              <div className="w-full">
                <div className="form_group_title">Product Details</div>
                <div className="owner_details_group">
                  <Field label="Product Name"><div className="owner_details_value">{asset?.product_name || "-"}</div></Field>
                  <Field label="Serial Number"><div className="owner_details_value">{asset?.asset_serial_number || "-"}</div></Field>
                  <Field label="PDT IFRIC ID"><IdValue value={asset?.id} /></Field>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-dialog-confirm">
          <h3 className="contract-header pt-1">
            <img src="/custom-field (1).svg" alt="Contracts Icon" />
            Contracts
          </h3>
          <div className="contract-display">
            {contracts === null ? (
              <span className="contract-item">Loading…</span>
            ) : contracts.length > 0 ? (
              contracts.map((name, index) => (
                <span key={index} className="contract-item">
                  {name}
                </span>
              ))
            ) : (
              <span className="contract-item">---- -----</span>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
