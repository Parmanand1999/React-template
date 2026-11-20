// import { useCallback, useEffect, useState } from "react";
// import { getClientsListData, getClientsListDataByPgination } from "@/Services/SuperAdminServices";
// import CustomButton from "./Buttons/CustomButton";
// import SingleSelectInfiniteDropdown from "./DropdownSelect/SingleSelectInfiniteDropdown";
// import { Building2, X } from "lucide-react";

// const ClientSelectModal = ({ isOpen, onClose, onSelect }) => {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedValue, setSelectedValue] = useState()


//   useEffect(() => {
//     if (!isOpen) return;
//     fetchClients();
//   }, [isOpen]);

//   const fetchClients = async ({ page = 1, search = '', pageSize = 10 }) => {
//     const buildQueryParams = () => {
//       const params = new URLSearchParams();
//       params.append("pageNo", page);
//       params.append("limit", pageSize);
//       if (search && search.trim()) {
//         params.append("search", search.trim());
//       }
//       params.append("parentOnly", "true");
//       return params.toString();
//     };
//     const queryString = buildQueryParams();
//     try {
//       setLoading(true);
//       const response = await getClientsListDataByPgination(queryString);
//       if (response?.status !== 200 || !response?.data?.data) {
//         return { data: [], pagination: null };
//       }

//       const { clientList = [], totalElement = 0, totalNoOfPages = 0, pageNo = 1, rowsPerPage = pageSize } = response.data.data;

//       const transformedData = clientList.map((client) => ({
//         id: client._id,
//         _id: client._id,
//         name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.roleName || 'Client',
//         ...client
//       }));

//       return {
//         data: transformedData,
//         pagination: {
//           currentPage: pageNo,
//           totalPages: totalNoOfPages,
//           totalItems: totalElement,
//           hasNextPage: pageNo < totalNoOfPages,
//           pageSize: rowsPerPage
//         }
//       };
//     } catch (err) {
//       console.error("Failed to fetch clients", err);
//       return { data: [], pagination: null };
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleClientBranchChange = useCallback((branch) => {
    
//     setSelectedValue(branch);
//     onSelect?.(branch);
//     onClose?.();
//     setSelectedValue()
//   }, []);

//   const getParentDisplayName = useCallback((list) => {

//     return list.name || `${list.firstName} ${list.lastName}` || "Unnamed Client";
//   }, []);

//   const getParentDescription = useCallback((list) => {
//     return `Email: ${list.email || 'N/A'} | Mobile: ${list.mobileNumber || 'N/A'}`;
//   }, []);


//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex justify-center">
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

//       <div className="relative bg-white w-full top-30 h-[35vh] max-w-3xl mx-4 rounded-xl shadow-lg animate-fadeIn">
//         <div className="flex justify-between items-center border-b px-5 py-3">
//           <div>
//             <h2 className="text-sm font-semibold">Select Client</h2>
//             <p className="text-xs text-gray-500">
//               Choose the client for whom you're creating this case. Selection is
//               required to proceed.
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             {/* <span className="text-xs text-red-500">
//               Client selection required
//             </span> */}
//             <X size={20} className="cursor-pointer  " onClick={() => onClose()} />
//           </div>

//         </div>

//         <div className="p-5 min-h-[50vh] h-auto space-y-3">
//           {loading && (
//             <p className="text-sm text-gray-500">Loading clients...</p>
//           )}

//           {/* {!loading && clients.length === 0 && (
//             <p className="text-sm text-gray-500">No clients found.</p>
//           )} */}

//           {/* <div className="grid gap-2">
//             {clients.map((client) => (
//               <div
//                 key={client._id}
//                 className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
//               >
//                 <div>
//                   <div className="font-medium">
//                     {client.email
//                       ? `${client.email}${client.firstName ? ` (${client.firstName}${client.lastName ? ` ${client.lastName}` : ""})` : ""}`
//                       : `${client.mobileNumber}${client.firstName ? ` (${client.firstName}${client.lastName ? ` ${client.lastName}` : ""})` : ""}`}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {client.organization?.organizationName}
//                   </div>
//                 </div>
//                 <div>
//                   <CustomButton
//                     className="h-8 px-3"
//                     onClick={() => handleSelect(client)}
//                   >
//                     Select
//                   </CustomButton>
//                 </div>
//               </div>
//             ))}
//           </div> */}
//           <SingleSelectInfiniteDropdown
//             label="Select Client"
//             placeholder="Select client"
//             selectedValue={selectedValue}
//             onSelectionChange={handleClientBranchChange}
//             fetchOptions={fetchClients}
//             startIcon={<Building2 size={18} />}
//             getOptionLabel={getParentDisplayName}
//             getOptionDescription={getParentDescription}

//           />

//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientSelectModal;
