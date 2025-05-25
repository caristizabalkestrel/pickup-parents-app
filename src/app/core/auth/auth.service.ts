// auth.service.ts
import { Injectable } from '@angular/core';
// Importaciones de Firebase Auth
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
// Importaciones de Firestore
import { Firestore, collection, query, where, getDocs, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  /**
   * Registra un nuevo usuario con email y contraseña en Firebase Authentication.
   * Este método es llamado por la página de registro.
   * @param email El correo electrónico del usuario.
   * @param password La contraseña del usuario.
   * @returns Una promesa que resuelve con las credenciales del usuario (UserCredential) o lanza un error.
   */
  async registerWithEmailAndPassword(email: string, password: string): Promise<any> {
    try {
      // Intenta crear el usuario con email y contraseña en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential; // Devuelve las credenciales para obtener el UID
    } catch (error: any) {
      // Captura y loggea cualquier error durante el registro de autenticación
      console.error('Error al registrar con email y contraseña en Firebase Auth:', error);
      throw error; // Propaga el error para que la página de registro lo maneje y muestre un mensaje al usuario
    }
  }

  /**
   * Guarda la relación cédula-email en la colección 'users' de Firestore.
   * Esto es fundamental para permitir el inicio de sesión con cédula.
   * @param userId El UID (User ID) del usuario de Firebase Auth.
   * @param cedula La cédula del usuario.
   * @param email El correo electrónico del usuario.
   */
  async saveUserCedulaEmail(userId: string, cedula: string, email: string): Promise<void> {
    try {
      // Obtiene una referencia a la colección 'users'
      const usersRef = collection(this.firestore, 'users');
      // Crea o actualiza un documento con el UID del usuario como ID del documento
      await setDoc(doc(usersRef, userId), {
        cedula: cedula,
        email: email,
      }, { merge: true }); // 'merge: true' fusiona los datos si el documento ya existe, sin sobrescribir otros campos
    } catch (error) {
      console.error('Error al guardar la relación cédula-email en Firestore:', error);
      throw error; // Propaga el error
    }
  }

  /**
   * Guarda la información completa del perfil del padre en la colección 'padres' de Firestore.
   * @param userId El UID (User ID) del usuario de Firebase Auth.
   * @param parentData Un objeto con los datos del padre (nombre, apellido, cedula, celular, correo).
   */
  async saveParentProfile(userId: string, parentData: { nombre: string, apellido: string, cedula: string, celular: string, correo: string }): Promise<void> {
    try {
      // Obtiene una referencia a la colección 'padres'
      const padresRef = collection(this.firestore, 'padres');
      // Crea o actualiza un documento con el UID del usuario como ID del documento
      await setDoc(doc(padresRef, userId), parentData, { merge: true });
    } catch (error) {
      console.error('Error al guardar el perfil del padre en Firestore:', error);
      throw error; // Propaga el error
    }
  }

  /**
   * Inicia sesión utilizando la cédula y contraseña del usuario.
   * Primero busca el correo electrónico asociado a la cédula en Firestore,
   * y luego utiliza ese correo para autenticar con Firebase Auth.
   * @param cedula La cédula del usuario.
   * @param password La contraseña del usuario.
   * @returns Una promesa que resuelve a `true` si el inicio de sesión es exitoso, `false` en caso contrario.
   */
  async loginWithCedula(cedula: string, password: string): Promise<boolean> {
    try {
      // 1. Consulta Firestore para encontrar el documento del usuario por su cédula
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('cedula', '==', cedula));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let email = '';
        // Asumiendo que la cédula es única, obtenemos el email del primer (y único) resultado
        querySnapshot.forEach((document) => {
          email = document.data()['email'];
        });

        if (email) {
          // 2. Si se encuentra un email asociado, intenta iniciar sesión con Firebase Auth
          await signInWithEmailAndPassword(this.auth, email, password);
          return true; // Inicio de sesión exitoso
        } else {
          console.warn('No se encontró un correo electrónico asociado a la cédula en Firestore.');
          return false;
        }
      } else {
        console.warn('No se encontró ningún usuario con la cédula proporcionada en Firestore.');
        return false; // No se encontró ningún usuario con esa cédula
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión con cédula:', error);
      throw error; // Propaga el error para que la página de login lo maneje
    }
  }

  /**
   * Inicia sesión utilizando la autenticación de Google (mediante un popup).
   * @returns Una promesa que resuelve a `true` si el inicio de sesión es exitoso, `false` en caso contrario.
   */
  async loginWithGoogle(): Promise<boolean> {
    try {
      const provider = new GoogleAuthProvider();
      // Abre una ventana emergente para que el usuario inicie sesión con su cuenta de Google
      const result = await signInWithPopup(this.auth, provider);

      // Opcional: Guarda información adicional del usuario de Google en la colección 'users' de Firestore
      const user = result.user;
      const usersCollectionRef = collection(this.firestore, 'users');
      const userDocRef = doc(usersCollectionRef, user.uid);

      // Guarda el email y nombre visible del usuario de Google.
      // Usamos merge: true para no sobrescribir si el documento ya existe (ej. si el usuario ya se había registrado con cédula).
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName || null, // Nombre que Google proporciona
        authProvider: 'google' // Campo para indicar el proveedor de autenticación
      }, { merge: true });

      // Si necesitas guardar el perfil completo del padre (nombre, apellido, celular) para usuarios de Google,
      // deberías añadir una lógica aquí para pedir esa información después del primer inicio de sesión con Google,
      // o redirigirlos a una página de "completar perfil". Por ahora, solo se guarda en 'users'.

      return true; // Inicio de sesión con Google exitoso
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error; // Propaga el error
    }
  }

  /**
   * Cierra la sesión del usuario actual en Firebase Authentication.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
