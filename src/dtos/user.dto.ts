import type {UserRole} from "@/dtos/auth.dto.ts";

export interface User {
    name: string
    email: string
    role: UserRole
}