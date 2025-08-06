import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { USER_ROLES } from '@/lib/constants';

export const DebugPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
        variant="outline"
        size="sm"
      >
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Debug Panel</CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">User:</Label>
              <Badge variant="secondary" className="text-xs">
                {user.email}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Role:</Label>
              <Badge className="text-xs">{user.role}</Badge>
            </div>
            <Button onClick={logout} size="sm" variant="outline" className="w-full">
              Logout
            </Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Not authenticated</div>
        )}
        
        <div className="pt-2 border-t">
          <Label className="text-xs">Environment: Development</Label>
        </div>
      </CardContent>
    </Card>
  );
};