import {useEffect,useState} from 'react';
import {Grid, Box} from '@mui/material'
import Items from './gridItems'
const Dashboard = () => {
  
    return(
        <>
        <Grid margin={10} container my={4} rowSpacing={2} columnSpacing={1}>
            <Grid item xs= '9'>
           <Box color={'white'} borderRadius={5} boxShadow={10} bgcolor='#333' p={2}>
            <Items/>
           </Box>
            </Grid>
            <Grid item xs='4'>
           <Box borderRadius={5} boxShadow={10} bgcolor='#e8eaf6' p={2}>
           <Items/>
           </Box>
            </Grid>
            <Grid item xs='4'>
           <Box borderRadius={5} boxShadow={10} bgcolor='#e8eaf6' p={2}>
           <Items/>
           </Box>
            </Grid>
            <Grid item xs='3'>
           <Box borderRadius={5} boxShadow={10} bgcolor='#e8eaf6' p={2}>
           <Items/>
           </Box>
            </Grid>
            </Grid>
        </>
    )

}
export default Dashboard