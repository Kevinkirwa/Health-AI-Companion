import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { toast } from 'react-hot-toast';
import { Hospital } from '@shared/schema';

export default function BookAppointment() {
  const { hospitalId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [reminderChannel, setReminderChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [notes, setNotes] = useState('');

  // Common appointment types
  const appointmentTypes = [
    'General Checkup',
    'Follow-up',
    'Consultation',
    'Emergency',
    'Vaccination',
    'Lab Test',
    'X-ray',
    'Other'
  ];

  useEffect(() => {
    if (!user) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }
    fetchHospitalDetails();
  }, [hospitalId]);

  const fetchHospitalDetails = async () => {
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}`);
      const data = await response.json();

      if (data.success) {
        setHospital(data.hospital);
      } else {
        toast.error(data.message || 'Failed to fetch hospital details');
        navigate('/hospitals');
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast.error('Failed to fetch hospital details');
      navigate('/hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !selectedType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: user?.id,
          doctorId: selectedDoctor,
          hospitalId,
          date: selectedDate,
          time: selectedTime,
          type: selectedType,
          notes,
          reminderChannel
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Appointment booked successfully!');
        navigate('/appointments');
      } else {
        toast.error(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading hospital details...</div>;
  }

  if (!hospital) {
    return <div className="text-center py-8">Hospital not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Appointment</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hospital Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{hospital.name}</h2>
          <p className="text-gray-600 mb-2">{hospital.address}</p>
          <p className="text-gray-600 mb-4">{hospital.county}, {hospital.subCounty}</p>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Available Specialties:</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Facilities:</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.facilities.map((facility) => (
                <span
                  key={facility}
                  className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Appointment Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Appointment Type</label>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  {appointmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reminder Channel</label>
                <Select
                  value={reminderChannel}
                  onChange={(e) => setReminderChannel(e.target.value as 'sms' | 'whatsapp' | 'email')}
                  required
                >
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Any additional information for the doctor..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Book Appointment
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 