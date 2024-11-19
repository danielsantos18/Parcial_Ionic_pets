import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VaccineService {
  private storage = getStorage();

  constructor(private firestore: Firestore) {}

  async addVaccine(petId: string, vaccineData: any) {
    const vaccinesRef = collection(this.firestore, `pets/${petId}/vaccines`);
    return await addDoc(vaccinesRef, vaccineData);
  }

  async deleteVaccine(petId: string, vaccineId: string) {
    const vaccineRef = doc(this.firestore, `pets/${petId}/vaccines/${vaccineId}`);
    return await deleteDoc(vaccineRef);
  }

  async updateVaccine(petId: string, vaccineId: string, vaccineData: any) {
    const vaccineRef = doc(this.firestore, `pets/${petId}/vaccines/${vaccineId}`);
    return await updateDoc(vaccineRef, vaccineData);
  }

  async uploadPDF(file: File): Promise<string> {
    const filePath = `vaccines/${file.name}`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

} 
