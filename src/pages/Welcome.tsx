
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import EcoLogo from '@/components/EcoLogo';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <EcoLogo size="lg" showTagline={false} />
        </motion.div>
        
        <motion.p 
          variants={itemVariants}
          className="text-gray-600 mb-8 max-w-md"
        >
          Your personal companion for tracking, understanding, and taking action on climate change.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-xs space-y-4"
        >
          <Button 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Log In
          </Button>
          
          <Button 
            onClick={() => navigate('/signup')}
            variant="outline"
            className="w-full"
          >
            Sign Up
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.footer 
        className="p-4 text-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        © 2025 EcoSmart - Taking Climate Action Together
      </motion.footer>
    </div>
  );
};

export default Welcome;
