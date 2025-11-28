'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail } from 'lucide-react';

interface InviteFormProps {
  tenantId: string;
  tenantSlug: string;
}

export function InviteForm({ tenantId, tenantSlug }: InviteFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('EDITOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/tenants/${tenantId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invite member');
      }

      setSuccess('Member invited successfully!');
      setTimeout(() => {
        router.push(`/${tenantSlug}/team`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          The user must already have an account. An invitation email will be sent.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={(value: any) => setRole(value)} disabled={isLoading}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">
              <div className="flex flex-col items-start">
                <span className="font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">Can manage team and content</span>
              </div>
            </SelectItem>
            <SelectItem value="EDITOR">
              <div className="flex flex-col items-start">
                <span className="font-medium">Editor</span>
                <span className="text-xs text-muted-foreground">Can create and edit content</span>
              </div>
            </SelectItem>
            <SelectItem value="VIEWER">
              <div className="flex flex-col items-start">
                <span className="font-medium">Viewer</span>
                <span className="text-xs text-muted-foreground">Read-only access</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inviting...
            </>
          ) : (
            'Send Invitation'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${tenantSlug}/team`)}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
