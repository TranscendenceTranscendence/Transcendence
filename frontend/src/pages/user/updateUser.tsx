import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useState } from "react";

export default function UpdateUser() {
    const [enabledTwoFactor, setEnabledTwoFactor] = React.useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    async function updateUser(formData: FormData) {
        const nickname = formData.get("nickname");

        if (!selectedFile)
            alert("No file selected");
        if (!nickname)
            alert("No nickname entered");

        var fd = new FormData();
        fd.append("avatar", selectedFile);
        fd.append("two_factor_enabled", enabledTwoFactor.toString());
        fd.append("nickname", nickname);

        fetch(`https://localhost:3000/users/me`, {
            method: 'PATCH',
            credentials: 'include',
            body: fd,
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            console.log('User updated successfully:', data);
        }).catch(error => {
            console.error('Failed to update user:', error);
        });
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); updateUser(new FormData(e.target as HTMLFormElement)); }}>
            <h1>Update user profile</h1>
            <div>Update Nickname :
            <input name="nickname" />
            </div>
            <div>
            <br />
                <label>
                    <input type="checkbox" checked={enabledTwoFactor} onChange={(e) => setEnabledTwoFactor(e.target.checked)} />
                    Enable Two Factor Authentication
                </label>
            </div><br />
            <div>
                <label htmlFor="avatar">Upload Avatar</label><br />
                <input type="file" id="avatar" name="avatar" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
            </div><br />
            <button type="submit">Update</button>
        </form>
        
    );
}