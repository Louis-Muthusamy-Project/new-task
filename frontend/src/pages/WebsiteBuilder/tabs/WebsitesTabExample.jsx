import React, { useState } from "react";
import { Button } from "antd";
import { Plus } from "lucide-react";
import WebsiteTemplateLibraryModal from "./WebsiteTemplateLibraryModal";
import WebsiteEditPage from "./WebsiteEditPage";


const WebsitesTabExample = () => {
  const [view, setView] = useState("list"); // "list" | "edit"
  const [modalOpen, setModalOpen] = useState(false);
  const [activeWebsite, setActiveWebsite] = useState(null);
  const [websites, setWebsites] = useState([]); // your existing websites list

  const handleCreate = (payload) => {
    // payload: { websiteName, description, source: 'zip'|'template', templateName, pages }
    const newWebsite = {
      name: payload.websiteName,
      description: payload.description,
      status: "Draft",
      pages: payload.pages,
    };
    setWebsites((prev) => [...prev, newWebsite]);
    setActiveWebsite(newWebsite);
    setModalOpen(false);
    setView("edit"); // <-- this is the "go to next page" step
  };

  if (view === "edit" && activeWebsite) {
    return (
      <WebsiteEditPage
        website={activeWebsite}
        justCreated
        onBack={() => setView("list")}
        onChange={(next) => setActiveWebsite(next)}
      />
    );
  }

  return (
    <div>
      <Button
        type="primary"
        icon={<Plus size={16} />}
        onClick={() => setModalOpen(true)}
        style={{ borderRadius: 8, height: 44, fontWeight: 700 }}
      >
        Add Website
      </Button>

      {/* ...render your existing websites table/list here... */}

      <WebsiteTemplateLibraryModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default WebsitesTabExample;
