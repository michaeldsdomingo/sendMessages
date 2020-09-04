import React, {useState} from 'react'
import axios from 'axios';

export default function SendTags () {
    const [recipients, updateRecipients] = useState("")
    const [qualifier, updateQualifier] = useState("")
    const [sendTo, updateSendTo] = useState("")
    const [sendType, updateSendType] = useState("")
    const [sent, updateSent] = useState(false)

    const getContacts = () => {
        return axios.get('https://sheetdb.io/api/v1/aka2sv6jd00dh')
    }

    const onGetContactsSuccess = (response) => {
        const sendToArray = sendTo.split(",")
        let results;
        let resultsDescription;
        const sendTypeParsed = parseSendType(sendType);

        if (sendTypeParsed !== 'error') {
            results = response.data.filter((contact) => {
                let isMatch;
                if (qualifier.toLowerCase() === "and") {
                    isMatch = true;
                    sendToArray.forEach(sendTo => {
                        if (!contact[sendTypeParsed].includes(sendTo)) {
                            isMatch = false;
                        }
                    })
                } else if (qualifier.toLowerCase() === "or") {
                    isMatch = false;
                    sendToArray.forEach(sendTo => {
                        if (contact[sendTypeParsed].includes(sendTo)) {
                            isMatch = true;
                        }
                    })
                }
                return isMatch
            })
            console.log(results)
            resultsDescription = results.length > 0 ? results.map((result) => {
                return <div key={result.id}>{result.firstName} {result.lastName} from {result.organizationId}</div>
            }) : 'No records found'
        }
        else {
            resultsDescription = 'Invalid SendType'
        }
       
        updateRecipients(resultsDescription)
        updateSent(true)
    }

    const onGetContactsError = (error) => {
        updateRecipients('Server Error')
        updateSent(true)
    }

    const parseSendType = (sendType) => {
        console.log(sendType.toLowerCase())
        if (sendType.toLowerCase() === 'tags') {
            return 'tags'
        }
        else if (sendType.toLowerCase() === 'organization') {
            return 'organization'
        }
        else if (sendType.toLowerCase().includes('first')) {
            return 'firstName'
        }
        else if (sendType.toLowerCase().includes('last')) {
            return 'lastName'
        }
        else {
            return 'error'
        }
    }

    const handleChange = (event) => {
        const value = event.target.value
        switch(event.target.name) {
            case "sendType":
                updateSendType(value)
                return
            case "sendTo":
                updateSendTo(value)
                return
            case "qualifier":
                updateQualifier(value)
                return
            default:
                return;
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        /*  implement me
            hint: we will probably need to update state here to render the right parts
        */
        getContacts().then(onGetContactsSuccess).catch(onGetContactsError)
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={{textAlign: "left"}}>
                <label style={{paddingRight: "10px"}}>
                    <div>
                        <span style={{paddingRight: "10px"}}>Send Type (Organization, First Name, Last Name, or Tags):</span>
                        <input type="text" name="sendType" onChange={handleChange}/>
                    </div>
                    <div>
                        <span style={{paddingRight: "10px", paddingTop: "20px"}}>Send To (separated by commas):</span>
                        <input type="text" name="sendTo" onChange={handleChange}/>
                    </div>
                    <div>
                        <span style={{paddingRight: "10px", paddingTop: "20px"}}>AND/OR?: </span>
                        <input type="text" name="qualifier" onChange={handleChange}/>
                    </div>
                </label>
                <input type="submit" value="Send Messages" />
            </form>
            { sent && <div>Sent to: {recipients}</div> }
        </div>
    )
}