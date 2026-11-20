import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CustomLoader from "@/components/common/CustomLoader";
import CustomButton from "@/components/common/Buttons/CustomButton";
import ClientFormModal from "../Components/ClientFormModal";
import { getClientById } from "@/Services/clientServices";

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const response = await getClientById(id);

      if (response?.status === 200) {
        const data = response?.data?.data || response?.data;
        setClientData(data);
      }
    } catch (error) {
      console.error("Failed to load client details:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load travel agent details"
      );
      navigate("/clients");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CustomLoader fixed />;
  }

  if (!clientData) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm max-w-xl mx-auto mt-8 text-center">
        <h2 className="text-xl font-semibold text-slate-800">Travel Agent Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The requested travel agent record could not be loaded.
        </p>
        <div className="mt-6">
          <CustomButton
            type="button"
            variant="outline"
            className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            onClick={() => navigate("/clients")}
          >
            Back to Travel Agent List
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <ClientFormModal
        clientId={id}
        initialData={clientData}
        isEdit={true}
        isModal={false}
        onSuccess={() => navigate("/clients")}
        onCancel={() => navigate("/clients")}
      />
    </div>
  );
};

export default EditClient;
