import Image from "next/image";
import { Button } from "primereact/button";
import '../../../public/styles/dashboard/custom-accordion.css';
import { useEffect, useState } from "react";

interface CustomAccordionProps {
  headerTemplate: () => React.ReactNode;
  bodyTemplate: () => React.ReactNode;
  expanded?: boolean;
}

export default function CustomAccordion({ headerTemplate, bodyTemplate, expanded = false }: CustomAccordionProps) {
    const[visible, setVisible] = useState<boolean>(expanded)
    useEffect(() => {
        setVisible(expanded);
      }, [expanded]);
  return (
    <div className="custom_accordion_wrapper">
      <Button className="custom_accordion_header" onClick={()=>setVisible(!visible)}>
        {headerTemplate()}
        <Image className={`accordion_arrow ${visible ? 'active' : ''}`} src="/dashboard/arrow_down.svg" width={24} height={24} alt='filter_icon' />
      </Button>
      <div className={`custom_accordion_body ${visible === true ? 'active' : ''}`}>
        {bodyTemplate()}
      </div>
    </div>
  );
}
