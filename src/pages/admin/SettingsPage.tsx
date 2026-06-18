import { useState } from 'react';
import { Moon, Sun, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Store');
  const [currency, setCurrency] = useState('USD');

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your store preferences.</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark mode</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark theme.</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <Switch />
              <Moon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Store name</Label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="My Store"
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
            <p className="text-xs text-muted-foreground">Currency code (e.g. USD, EUR, GBP)</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'New orders', desc: 'Get notified when a new order is placed.' },
            { label: 'Low stock alerts', desc: 'Get notified when product stock falls below 20.' },
            { label: 'Customer reviews', desc: 'Get notified when a new review is submitted.' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <Label>{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="gap-2">
        <Store className="w-4 h-4" strokeWidth={1.5} />
        Save Settings
      </Button>
    </div>
  );
}
