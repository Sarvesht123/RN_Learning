import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { Customer, loginCustomer, registerCustomer } from '@/services/commerce';

type CustomerValue = {
  customer: Customer | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: Omit<Customer, 'id'> & { password: string }) => Promise<void>;
  signOut: () => void;
};
const CustomerContext = createContext<CustomerValue | null>(null);

export function CustomerProvider({ children }: PropsWithChildren) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const signIn = async (email: string, password: string) => setCustomer((await loginCustomer(email, password)).customer);
  const register = async (input: Omit<Customer, 'id'> & { password: string }) => setCustomer((await registerCustomer(input)).customer);
  return <CustomerContext.Provider value={{ customer, signIn, register, signOut: () => setCustomer(null) }}>{children}</CustomerContext.Provider>;
}
export function useCustomer() {
  const value = useContext(CustomerContext);
  if (!value) throw new Error('useCustomer must be used inside CustomerProvider');
  return value;
}
