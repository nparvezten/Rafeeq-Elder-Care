# Legal & Data Notes

**This is not legal advice.** This file explains the choices made in this project and things to think about. For anything specific to your situation — especially if you plan to run this for more than your own family — talk to an actual lawyer.

## 1. License
MIT — see [LICENSE.md](./LICENSE.md). Free to fork, modify, and use, personally or commercially.

## 2. Not a medical product
Rafeeq Care does not provide medical advice, diagnosis, or treatment, and is not designed to store medical records. It's an administrative tool for logistics — who to call, who paid what. Any decision about a family member's care or treatment should be made with an actual doctor.

## 3. Why no health data — on purpose
Storing diagnoses, medication logs, or clinical notes turns this into a health-data system, which brings real obligations: in India that likely means the Digital Personal Data Protection Act (DPDP Act, 2023) applies extra care requirements to that category of data; other countries have their own frameworks (HIPAA in the US, GDPR's special-category provisions in the EU, and so on). Meeting those properly needs an actual legal and security review — not a code comment claiming "compliant." This project avoids the problem for v0 by simply not collecting that category of data at all. If you fork this and want to add health data later, treat that as a serious decision requiring real legal review, not a routine feature addition.

## 4. Whose data is it, if you fork this
Each fork is independent. If you fork Rafeeq Care and run your own copy on your own Supabase project, **you** are the operator and controller of whatever data you put into it. The original project has no access to your fork's data and no responsibility for how you configure or secure it. Review your own Supabase project's Row Level Security policies before inviting family members.

## 5. No warranty, no audit
This software is provided as-is (see LICENSE.md). It has not had a formal security audit. If you're putting anything sensitive into a fork of this, that review is on you before you do it.

## 6. Name and identity
"Rafeeq Care" / رفيق is used here descriptively (companion, friend) and isn't a registered trademark. Feel free to rename your fork.
