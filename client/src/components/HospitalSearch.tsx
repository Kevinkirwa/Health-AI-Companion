import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface Hospital {
  id: string;
  name: string;
  code: string;
  level: string;
  ownership: string;
  services: string[];
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  location: {
    county: string;
    subCounty: string;
    ward?: string;
  };
}

export const HospitalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [county, setCounty] = useState('');
  const [level, setLevel] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    const searchHospitals = async () => {
      if (!debouncedSearch && !county && !level) {
        setHospitals([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('query', debouncedSearch);
        if (county) params.append('county', county);
        if (level) params.append('level', level);
        
        const response = await fetch(`/api/hospitals/search?${params}`);
        if (!response.ok) throw new Error('Failed to fetch hospitals');
        
        const data = await response.json();
        setHospitals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    searchHospitals();
  }, [debouncedSearch, county, level]);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Counties</option>
            {/* Add county options */}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
            <option value="Level 4">Level 4</option>
            <option value="Level 5">Level 5</option>
            <option value="Level 6">Level 6</option>
          </select>
        </div>
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold">{hospital.name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>Code: {hospital.code}</p>
                <p>Level: {hospital.level}</p>
                <p>Ownership: {hospital.ownership}</p>
                <p>Location: {hospital.location.county}, {hospital.location.subCounty}</p>
                {hospital.contact.phone && (
                  <p>Phone: {hospital.contact.phone}</p>
                )}
                {hospital.services.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Services:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hospital.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {!loading && !error && hospitals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hospitals found. Try adjusting your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 