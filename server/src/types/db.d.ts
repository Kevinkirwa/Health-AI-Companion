declare module '../config/db.js' {
  import { Connection } from 'mongoose';
  
  const connectDatabase: () => Promise<Connection>;
  export default connectDatabase;
} 