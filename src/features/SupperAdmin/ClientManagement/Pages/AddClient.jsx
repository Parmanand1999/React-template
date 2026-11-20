import React from "react";
import { useNavigate } from "react-router-dom";
import ClientFormModal from "../Components/ClientFormModal";

const AddClient = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <ClientFormModal
        isEdit={false}
        isModal={false}
        onSuccess={() => navigate("/clients")}
        onCancel={() => navigate("/clients")}
      />
    </div>
  );
};

export default AddClient;
