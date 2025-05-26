declare module '@shared/schema' {
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
  }

  export interface Hospital {
    id: string;
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    phone?: string;
    email?: string;
    website?: string;
    openHours?: string;
    specialties: string[];
  }

  export interface Doctor {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialties: string[];
    hospitals: string[];
  }

  export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    hospitalId: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes?: string;
    reminderPreferences?: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      intervals: number[];
    };
  }

  export interface Schedule {
    id: string;
    doctorId: string;
    hospitalId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }

  export interface MedicalRecord {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    diagnosis: string;
    prescription?: string;
    notes?: string;
  }

  export interface Patient {
    id: string;
    name: string;
    email: string;
    phone?: string;
    whatsappNumber?: string;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
  }
}

declare module '@radix-ui/react-accordion' {
  export * from '@radix-ui/react-accordion';
}

declare module '@radix-ui/react-aspect-ratio' {
  export * from '@radix-ui/react-aspect-ratio';
}

declare module '@radix-ui/react-collapsible' {
  export * from '@radix-ui/react-collapsible';
}

declare module '@radix-ui/react-context-menu' {
  export * from '@radix-ui/react-context-menu';
}

declare module '@radix-ui/react-dropdown-menu' {
  export * from '@radix-ui/react-dropdown-menu';
}

declare module '@radix-ui/react-hover-card' {
  export * from '@radix-ui/react-hover-card';
}

declare module '@radix-ui/react-menubar' {
  export * from '@radix-ui/react-menubar';
}

declare module '@radix-ui/react-navigation-menu' {
  export * from '@radix-ui/react-navigation-menu';
}

declare module '@radix-ui/react-popover' {
  export * from '@radix-ui/react-popover';
}

declare module '@radix-ui/react-radio-group' {
  export * from '@radix-ui/react-radio-group';
}

declare module '@radix-ui/react-separator' {
  export * from '@radix-ui/react-separator';
}

declare module '@radix-ui/react-slider' {
  export * from '@radix-ui/react-slider';
}

declare module '@radix-ui/react-toggle' {
  export * from '@radix-ui/react-toggle';
}

declare module '@radix-ui/react-toggle-group' {
  export * from '@radix-ui/react-toggle-group';
}

declare module '@radix-ui/react-tooltip' {
  export * from '@radix-ui/react-tooltip';
}

declare module 'cmdk' {
  export * from 'cmdk';
}

declare module 'embla-carousel-react' {
  export * from 'embla-carousel-react';
}

declare module 'input-otp' {
  export * from 'input-otp';
}

declare module 'react-resizable-panels' {
  export * from 'react-resizable-panels';
}

declare module 'vaul' {
  export * from 'vaul';
} 