# Revenue Intelligence Inbox

**A conversation intelligence application that helps sales managers organise, review, and route call and meeting records into actionable outputs.**

## 🚀 Live Demo

**Deployed Application:** https://revenu-ai.netlify.app/

## 📌 Project Overview

Revenue Intelligence Inbox is designed to simplify how sales managers handle conversation records collected from multiple sources. It brings call records, meeting information, transcripts, and notes into an organised workflow.

The application helps managers review conversation activity, identify records that need attention, understand routing decisions, and organise outputs for further action.

The primary focus is to make conversation management more efficient, transparent, and reliable.

## 🎯 Objectives

* Centralise call and meeting records in one interface.
* Provide visibility into conversation activity and transcript availability.
* Route conversation records to appropriate destinations.
* Support evidence-based decisions with traceable information.
* Identify records that require manual review.
* Maintain reliable records when data is imported repeatedly or updated.
* Organise outputs with a structured manifest for traceability.

## ✨ Key Features

### 1. Conversation Dashboard

Provides an overview of conversation activity, record status, transcript coverage, and routing information.

### 2. Conversation Inbox

Organises call and meeting records so that managers can inspect individual conversations and their available information.

### 3. Evidence-Based Routing

Helps categorise conversations based on available evidence and direct them towards relevant destinations.

### 4. Human Review

Supports manual review when the available information is incomplete, ambiguous, or insufficient to justify an automated decision.

### 5. Import and Update Handling

The intended workflow supports repeat imports without creating duplicate records and updates existing records when new information arrives.

### 6. Structured Exports

Organises processing results and routing information in a structured format, including source references, output paths, review status, and manual correction details.

## 📊 Dataset Overview

The assignment dataset contains:

| Record Type | Number of Records |
| ----------- | ----------------: |
| Calls       |                30 |
| Meetings    |                14 |
| **Total**   |            **44** |

The dataset includes conversation text for a subset of records. Missing transcripts must not be interpreted as proof that a conversation did not occur.

## 🔄 Application Workflow

1. **Import Records:** Load call and meeting records from the supplied data.
2. **Organise Conversations:** Display records in a centralised inbox.
3. **Review Available Evidence:** Inspect transcripts and supporting information.
4. **Route Conversations:** Assign suitable destinations based on available evidence.
5. **Flag Uncertain Cases:** Send ambiguous or incomplete records for human review.
6. **Generate Outputs:** Organise the results and maintain a structured manifest.
7. **Validate Updates:** Check that repeated imports do not create duplicates and that updates preserve applicable manual corrections.

## 🛠️ Technology Stack

Update this section to reflect the technologies actually used in your implementation.

* **Frontend:** [Add the frontend framework]
* **Styling:** [Add the styling framework or CSS approach]
* **Backend:** [Add the backend technology, if applicable]
* **Database:** [Add the database, if applicable]
* **Deployment:** Netlify

## ⚙️ Running Locally

Follow these steps if the project uses a Node.js-based frontend.

### Prerequisites

* Node.js
* npm
* Git

### Installation

```bash
git clone <your-github-repository-url>
cd <your-project-folder>
npm install
```

### Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

> **Note:** These commands assume a Node.js frontend project. Update them if your repository uses a different setup or requires separate backend services.

## 🧪 Testing and Validation

The following checks are important for validating the application:

* Verify that all 44 source records are accounted for.
* Confirm that repeated imports do not create duplicate records.
* Verify that updated transcripts appear on existing records.
* Check that manual route corrections persist when required.
* Ensure that missing transcript content is not treated as evidence of a nonexistent conversation.
* Verify that routing decisions are supported by available evidence.
* Confirm that exported files and manifest entries correspond to the correct source records.

Only mark these checks as passed after testing them against the actual application.

## 🔮 Future Enhancements

* Improve filtering by person, source type, date, and review status.
* Add clearer evidence previews for routing decisions.
* Improve prioritisation of conversations requiring manual attention.
* Strengthen import validation and update tracking.
* Provide more detailed reporting on conversation activity.
* Improve export validation and error handling.

## 👩‍💻 Project Information

**Project Name:** Revenue Intelligence Inbox
**Project Type:** Conversation Intelligence and Workflow Management
**Live Application:** https://revenu-ai.netlify.app/

## 📝 Conclusion

Revenue Intelligence Inbox aims to turn scattered call and meeting information into organised, traceable, and actionable outputs. By combining conversation review, evidence-based routing, human oversight, and reliable data handling, the application supports a more structured approach to sales conversation management.

The project emphasises explainability and data reliability so that managers can make informed decisions based on the available evidence.

