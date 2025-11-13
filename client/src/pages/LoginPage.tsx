import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setCredentials } from '@/app/slices/authSlice';
import { getRoleDashboardPath } from '@/utils/roles';
import { RootState } from '@/app/store';
import { toast } from 'sonner';

// Mock users for demonstration
const mockUsers = {
  'seller@demo.com': { role: 'seller', name: 'Rajesh Kumar', password: 'demo123' },
  'delivery@demo.com': { role: 'delivery', name: 'Amit Singh', password: 'demo123' },
  'salesman@demo.com': { role: 'salesman', name: 'Vikram Patel', password: 'demo123' },
  'customer@demo.com': { role: 'customer', name: 'Ravi Merchant', password: 'demo123' },
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboardPath(user.role));
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = (data: any) => {
    const mockUser = mockUsers[data.email as keyof typeof mockUsers];
    
    if (mockUser && mockUser.password === data.password) {
      const userData = {
        id: `USER-${Date.now()}`,
        name: mockUser.name,
        email: data.email,
        role: mockUser.role as any,
      };
      
      dispatch(setCredentials({
        user: userData,
        token: 'mock-jwt-token-' + Date.now(),
      }));
      
      toast.success(`Welcome back, ${mockUser.name}!`);
      navigate(getRoleDashboardPath(mockUser.role as any));
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">DS</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message as string}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-semibold mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Seller: seller@demo.com / demo123</p>
              <p>Delivery: delivery@demo.com / demo123</p>
              <p>Salesman: salesman@demo.com / demo123</p>
              <p>Customer: customer@demo.com / demo123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
