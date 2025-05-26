import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface Hospital {
  id: number;
  name: string;
  county: string;
  contact: {
    address: string;
    phone: string;
    email?: string;
  };
  services: string[];
  departments: string[];
}

const EmergencyHospitalFinder: React.FC = () => {
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [emergencyType, setEmergencyType] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');

  const { data: hospitals, isLoading, error } = useQuery({
    queryKey: ['nearestHospitals', selectedCounty, emergencyType, severity],
    queryFn: async () => {
      if (!selectedCounty) return [];
      
      const response = await fetch('/api/emergency/nearest-hospitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: { county: selectedCounty },
          emergencyType: emergencyType ? {
            type: emergencyType,
            severity: severity || 'urgent'
          } : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();
      return data.data as Hospital[];
    },
    enabled: !!selectedCounty,
  });

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Nyeri', 'Meru',
    'Kakamega', 'Kisii', 'Garissa', 'Bungoma', 'Busia', 'Elgeyo Marakwet',
    'Embu', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni',
    'Mandera', 'Marsabit', 'Migori', 'Murang\'a', 'Nandi', 'Narok', 'Nyamira',
    'Nyandarua', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  const emergencyTypes = [
    { value: 'cardiac', label: 'Cardiac Emergency' },
    { value: 'trauma', label: 'Trauma Emergency' },
    { value: 'pediatric', label: 'Pediatric Emergency' },
    { value: 'obstetric', label: 'Obstetric Emergency' },
    { value: 'general', label: 'General Emergency' }
  ];

  const severityLevels = [
    { value: 'critical', label: 'Critical' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'stable', label: 'Stable' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Nearest Emergency Hospital</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={selectedCounty}
                onValueChange={setSelectedCounty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={emergencyType}
                onValueChange={setEmergencyType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={severity}
                onValueChange={setSeverity}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : 'Failed to fetch hospitals'}
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-4">Loading hospitals...</div>
            ) : hospitals && hospitals.length > 0 ? (
              <div className="grid gap-4">
                {hospitals.map((hospital) => (
                  <Card key={hospital.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{hospital.name}</h3>
                          <p className="text-sm text-muted-foreground">{hospital.county} County</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Get Directions
                        </Button>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          {hospital.contact.address}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2" />
                          {hospital.contact.phone}
                        </div>
                        {hospital.contact.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2" />
                            {hospital.contact.email}
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          24/7 Emergency Services
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Available Services:</h4>
                        <div className="flex flex-wrap gap-2">
                          {hospital.services.map((service) => (
                            <span
                              key={service}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No hospitals found. Please try a different location or emergency type.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyHospitalFinder; 