// For writes — Firestore generates the document ID, so no docId field here
export interface ICustomersDoc {
  companyName: string;
  address: string;
  taxId: string;
  phone: string;
}

// For reads/display — docId is populated client-side from doc.id after fetch
export interface ICustomers extends ICustomersDoc {
  docId: string;
}
