import React from "react";
import '../css/PasswordPrompt.css';
import { useState } from "react";

interface PasswordPromptProps {
    onSubmit: (password: string) => void;
}

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSubmit }) => {
    const [passwordInput, setPasswordInput] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(passwordInput);
        setPasswordInput("");
    };

    return (
        <div className="PasswordPrompt">
            <h1>Password is needed for this room!!</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};