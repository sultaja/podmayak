
import React from 'react';
import { 
  Sofa, Layout, Armchair, Lamp, ScanLine, Palmtree, Grid, Tv, FileText, Sparkles, Box, 
  Monitor, Zap, ImageIcon, Dumbbell, Film, Book, Shirt, Coffee, Briefcase, Leaf
} from 'lucide-react';

export const getIconComponent = (iconName: string, className: string = "w-4 h-4") => {
  const icons: Record<string, React.ReactNode> = {
    'Sofa': <Sofa className={className} />,
    'Layout': <Layout className={className} />,
    'Armchair': <Armchair className={className} />,
    'Lamp': <Lamp className={className} />,
    'ScanLine': <ScanLine className={className} />,
    'Palmtree': <Palmtree className={className} />,
    'Grid': <Grid className={className} />,
    'Tv': <Tv className={className} />,
    'FileText': <FileText className={className} />,
    'Sparkles': <Sparkles className={className} />,
    'Box': <Box className={className} />,
    'Monitor': <Monitor className={className} />,
    'Zap': <Zap className={className} />,
    'ImageIcon': <ImageIcon className={className} />,
    'Dumbbell': <Dumbbell className={className} />,
    'Film': <Film className={className} />,
    'Book': <Book className={className} />,
    'Shirt': <Shirt className={className} />,
    'Coffee': <Coffee className={className} />,
    'Briefcase': <Briefcase className={className} />,
    'Leaf': <Leaf className={className} />,
  };

  return icons[iconName] || <Box className={className} />;
};
