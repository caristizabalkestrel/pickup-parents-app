import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  /**
   * Registra un nuevo usuario con email y contraseña en Firebase Authentication.
   * @param email El correo electrónico del usuario.
   * @param password La contraseña del usuario.
   * @returns Una promesa que resuelve con las credenciales del usuario o null si hay un error.
   */
  async registerWithEmailAndPassword(email: string, password: string): Promise<any> {
    try {
      // Intenta crear el usuario con email y contraseña
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error: any) {
      // Captura y loggea cualquier error durante el registro
      console.error('Error al registrar con email y contraseña:', error);
      // Puedes manejar errores específicos aquí (ej. email ya en uso)
      throw error; // Propaga el error para que la página de registro lo maneje
    }
  }

  /**
   * Inicia sesión con la cédula del usuario.
   * Busca el correo asociado a la cédula en Firestore y luego usa ese correo para autenticar.
   * @param cedula La cédula del usuario.
   * @param password La contraseña del usuario.
   * @returns Una promesa que resuelve a true si el login es exitoso, false en caso contrario.
   */
  async loginWithCedula(cedula: string, password: string): Promise<boolean> {
    try {
      // 1. Consulta Firestore para encontrar el email asociado a la cédula
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('cedula', '==', cedula));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let email = '';
        // Asumiendo que la cédula es única, tomamos el primer resultado
        querySnapshot.forEach((document) => {
          email = document.data()['email'];
        });

        if (email) {
          // 2. Si se encuentra el email, intenta iniciar sesión con Firebase Auth
          await signInWithEmailAndPassword(this.auth, email, password);
          return true; // Login exitoso
        } else {
          console.warn('No se encontró un email asociado a la cédula en Firestore.');
          return false;
        }
      } else {
        console.warn('No se encontró ningún usuario con la cédula proporcionada en Firestore.');
        return false; // No se encontró usuario con esa cédula
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión con cédula:', error);
      // Puedes manejar errores específicos de Firebase Auth aquí (ej. 'auth/wrong-password')
      throw error; // Propaga el error para que la página de login lo maneje
    }
  }

  /**
   * Inicia sesión utilizando la autenticación de Google (popup).
   * @returns Una promesa que resuelve a true si el login es exitoso, false en caso contrario.
   */
  async loginWithGoogle(): Promise<boolean> {
    try {
      const provider = new GoogleAuthProvider();
      // Abre un popup para que el usuario inicie sesión con Google
      const result = await signInWithPopup(this.auth, provider);

      // Opcional: Puedes guardar información adicional del usuario de Google en Firestore
      // Por ejemplo, si quieres mantener un registro de todos los usuarios, incluyendo los de Google.
      const user = result.user;
      const usersCollectionRef = collection(this.firestore, 'users');
      // Usamos el UID de Firebase Auth como ID del documento en Firestore
      const userDocRef = doc(usersCollectionRef, user.uid);

      // Aseguramos que el documento exista y guardamos su email y, si está disponible, su nombre
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName || null, // Nombre del usuario de Google
        // Aquí podrías añadir un campo para indicar que se registró con Google si es relevante
        authProvider: 'google'
      }, { merge: true }); // merge: true para no sobrescribir si el documento ya existe

      return true; // Login con Google exitoso
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      // Manejo de errores específicos de Google Auth (ej. 'auth/popup-closed-by-user')
      throw error; // Propaga el error para que la página de login lo maneje
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      // Opcional: Redirigir al usuario a la página de login después de cerrar sesión
      // this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
