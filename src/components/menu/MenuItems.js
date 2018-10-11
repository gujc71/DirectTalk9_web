import React from 'react';
import {NavLink} from 'react-router-dom' 
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import UsersIcon from '@material-ui/icons/Group';
import RoomsIcon from '@material-ui/icons/Forum';
import PersonIcon from '@material-ui/icons/Person';

const styles = theme => ({
  item: {
     textDecoration: 'none'
  }
});

function MenuItems(props) {
  const { classes } = props;
  return (
  <div>
	<NavLink to="UserList" className={classes.item} activeClassName="active">	
		<ListItem button>
		  <ListItemIcon>
			<UsersIcon />
		  </ListItemIcon>
		  <ListItemText primary="Users" />
		</ListItem>
	</NavLink>
	<NavLink to="RoomList" className={classes.item} activeClassName="active">	
		<ListItem button>
		  <ListItemIcon>
			<RoomsIcon />
		  </ListItemIcon>
		  <ListItemText primary="Rooms" />
		</ListItem>
	</NavLink>
    <NavLink to="UserProfile" className={classes.item} activeClassName="active">    
        <ListItem button >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
    </NavLink>
  </div>
  );
}

MenuItems.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MenuItems);