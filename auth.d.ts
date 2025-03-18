declare module '#auth-utils' {
  interface User {
    id: string
    firstName: string
    middleName: string
    lastName: string
    avatarUrl:string
    role: string
    email: string
    createdAt: string
    followers: []
    followed: []
  }

  interface UserSession {

  }

  interface SecureSessionData {

  }
}