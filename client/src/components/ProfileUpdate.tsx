import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';

const profileUpdateSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number')
    .optional()
    .or(z.literal('')),
  whatsappNumber: z.string()
    .min(10, 'WhatsApp number must be at least 10 digits')
    .regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number')
    .optional()
    .or(z.literal('')),
  notificationPreferences: z.object({
    sms: z.boolean().default(false),
    whatsapp: z.boolean().default(true),
    email: z.boolean().default(true),
  }),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export function ProfileUpdate() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      phone: user?.phone || '',
      whatsappNumber: user?.whatsappNumber || '',
      notificationPreferences: {
        sms: user?.preferences?.notificationChannels?.sms || false,
        whatsapp: user?.preferences?.notificationChannels?.whatsapp || true,
        email: user?.preferences?.notificationChannels?.email || true,
      },
    },
  });

  const onSubmit = async (data: ProfileUpdateForm) => {
    try {
      setIsLoading(true);
      await updateUser({
        ...data,
        preferences: {
          ...user?.preferences,
          notificationChannels: data.notificationPreferences,
        },
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
        <CardDescription>
          Add your phone and WhatsApp numbers to receive appointment notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+254712345678"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your phone number in Kenyan format (+254 or 0 followed by 9 digits)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+254712345678"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your WhatsApp number in Kenyan format (+254 or 0 followed by 9 digits)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              
              <FormField
                control={form.control}
                name="notificationPreferences.sms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Receive SMS notifications
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notificationPreferences.whatsapp"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Receive WhatsApp notifications
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notificationPreferences.email"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Receive email notifications
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 