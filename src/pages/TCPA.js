import React, { useState, useEffect } from "react";

function TCPA() {
  const [consentMessage, setConsentMessage] = useState("");

  useEffect(() => {
    // Fetch existing TCPA settings
    fetch("/api/tcpa")
      .then((res) => res.json())
      .then((data) => setConsentMessage(data.consentMessage || ""))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/tcpa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consentMessage }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("TCPA saved:", data);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>TCPA Compliance</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Consent Message:
          <textarea
            value={consentMessage}
            onChange={(e) => setConsentMessage(e.target.value)}
          />
        </label>
        <button type="submit">Save TCPA Settings</button>
      </form>
    </div>
  );
}

export default TCPA;
