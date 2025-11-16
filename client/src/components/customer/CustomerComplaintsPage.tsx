import { ComplaintForm } from './ComplaintForm';

export const CustomerComplaintsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">File a Complaint</h2>
        <p className="text-muted-foreground">Report issues or provide feedback about your orders</p>
      </div>
      <ComplaintForm />
    </div>
  );
};
