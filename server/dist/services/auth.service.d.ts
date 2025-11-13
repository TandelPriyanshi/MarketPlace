import { User, UserRole } from '../models/user.model';
declare class AuthService {
    registerUser(email: string, password: string, name: string, phone: string, role?: UserRole): Promise<{
        user: any;
        token: string;
    }>;
    loginUser(email: string, password: string): Promise<{
        user: any;
        token: string;
    }>;
    private generateToken;
    private getUserWithoutPassword;
    validateToken(token: string): Promise<User>;
}
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=auth.service.d.ts.map