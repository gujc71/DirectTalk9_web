
//const styles = {
const styles = theme => ({	
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  ListItemSecondaryAction: {
    maxWidth: '50%'
  },
  list: {
    overflow: 'auto',
    maxHeight: '70vh',
  },
  Avata:{
	  border: "1px solid #bdbdbd"
  },
  Image: {
      width: '40px',
      height: '40px',
  }
});

export default styles;
