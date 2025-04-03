import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  TextIcon, 
  ImageIcon, 
  ButtonIcon, 
  SpacerIcon, 
  DividerIcon,
  HeadingIcon,
  QuoteIcon,
  ListIcon,
  TableIcon,
  VideoIcon,
  SocialIcon,
  FormIcon,
  MapIcon,
  CountdownIcon,
  ProgressIcon,
  RatingIcon,
  AccordionIcon,
  TabsIcon,
  CarouselIcon,
  GalleryIcon,
  MenuIcon,
  FooterIcon,
  HeaderIcon,
  BackgroundIcon,
  BorderIcon,
  ShadowIcon,
  AnimationIcon,
  LinkIcon,
  CodeIcon,
  TemplateIcon
} from './icons';

const DraggableComponent = ({ type, label, description }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EMAIL_COMPONENT',
    item: { type, label, description },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`draggable-component ${isDragging ? 'dragging' : ''}`}
    >
      <div className="component-icon">
        {getComponentIcon(type)}
      </div>
      <div className="component-info">
        <span className="component-label">{label}</span>
        <span className="component-description">{description}</span>
      </div>
    </div>
  );
};

const getComponentIcon = (type) => {
  switch (type) {
    case 'text':
      return <TextIcon />;
    case 'heading':
      return <HeadingIcon />;
    case 'quote':
      return <QuoteIcon />;
    case 'image':
      return <ImageIcon />;
    case 'button':
      return <ButtonIcon />;
    case 'spacer':
      return <SpacerIcon />;
    case 'divider':
      return <DividerIcon />;
    case 'list':
      return <ListIcon />;
    case 'table':
      return <TableIcon />;
    case 'video':
      return <VideoIcon />;
    case 'social':
      return <SocialIcon />;
    case 'form':
      return <FormIcon />;
    case 'map':
      return <MapIcon />;
    case 'countdown':
      return <CountdownIcon />;
    case 'progress':
      return <ProgressIcon />;
    case 'rating':
      return <RatingIcon />;
    case 'accordion':
      return <AccordionIcon />;
    case 'tabs':
      return <TabsIcon />;
    case 'carousel':
      return <CarouselIcon />;
    case 'gallery':
      return <GalleryIcon />;
    case 'menu':
      return <MenuIcon />;
    case 'footer':
      return <FooterIcon />;
    case 'header':
      return <HeaderIcon />;
    case 'background':
      return <BackgroundIcon />;
    case 'border':
      return <BorderIcon />;
    case 'shadow':
      return <ShadowIcon />;
    case 'animation':
      return <AnimationIcon />;
    case 'link':
      return <LinkIcon />;
    case 'code':
      return <CodeIcon />;
    case 'template':
      return <TemplateIcon />;
    default:
      return <TextIcon />;
  }
};

export default DraggableComponent; 