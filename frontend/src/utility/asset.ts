import { Asset } from "@/interfaces/assetTypes";
import axios from "axios";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;


    // Function to map the backend data to the Asset structure
    const mapBackendDataToAsset = (backendData: any[]): Asset[] => {
        console.log("Before Formatting", backendData);

        return backendData.map((item: any) => {
            const newItem: any = {};
            Object.keys(item).forEach((key) => {
                if (key.includes("http://www.industry-fusion.org/schema#")) {
                    const newKey = key.replace(
                        "http://www.industry-fusion.org/schema#",
                        ""
                    );

                    if (item[key].type === "Property") {
                        newItem[newKey] = item[key].value
                    }
                    else if (item[key].type === "Relationship") {
                        newItem[newKey] = item[key].object
                    }
                }
                else {
                    if (key == "type" || key == "id") {
                        newItem[key] = item[key]
                    }
                }
            });
            return newItem;
        });
    };

export  const fetchAssets = async () => {
    try {
        const response = await axios.get(BACKEND_API_URL + "/asset", {
            headers: {
                "Content-Type": "application/ld+json",
                "Accept": "application/ld+json"
            }
        });

        const responseData = response.data;
        console.log(responseData , "what's the response from assets");
        
        const mappedData = mapBackendDataToAsset(responseData);
        return mappedData;
        console.log("Formatted data:: ", mappedData);       
    } catch (error:any) {
          console.error("Error:", error);  
      }
};
