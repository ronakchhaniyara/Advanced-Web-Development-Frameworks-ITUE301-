import { useState } from "react";

function Contact() {
  const [message, setMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section className="content-card contact-card">
      <h1>Contact</h1>
      <p className="section-copy">
        This page demonstrates a controlled input and a second state value for UI visibility.
      </p>

      <button
        type="button"
        className="toggle-button"
        onClick={() => setShowHelp((currentValue) => !currentValue)}
      >
        {showHelp ? "Hide Help" : "Show Help"}
      </button>

      {showHelp && (
        <p className="help-text">
          Type a short message below. React updates the UI on every keystroke.
        </p>
      )}

      <label className="form-field" htmlFor="contact-message">
        Your Message
      </label>
      <input
        id="contact-message"
        type="text"
        placeholder="Enter your message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />

      <p>You typed: {message || "Nothing yet"}</p>
      <p>Character count: {message.length}</p>
    </section>
  );
}

export default Contact;
