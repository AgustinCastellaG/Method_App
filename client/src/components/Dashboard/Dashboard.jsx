import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

const columns = [
  { id: 'fromName', label: 'Name', minWidth: 170 },
  { id: 'ein', label: 'EIN', minWidth: 100 },
  {
    id: 'toName',
    label: 'Name',
    minWidth: 100,
    align: 'right'
  },
  {
    id: 'dunkinId',
    label: 'Dunkin Id',
    minWidth: 100,
    align: 'center'
  },
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 150,
    align: 'right',
    format: (value) => value.toFixed(2),
  },
];

const Dashboard = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([])

  useEffect(() => {
    let tempRows = data.data.data.map((item) => { 
      if (item) {
        return { fromName: item.Payor.name, ein: item.Payor.ein, toName: `${item.Employee.firstName} ${item.Employee.lastName}`, dunkinId: item.Employee.dunkinId, amount: item.Amount }
      }
    })
    setRows(tempRows)
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', marginTop: '150px' }} elevation={4}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={2}>
                From
              </TableCell>
              <TableCell align="center" colSpan={2}>
                To
              </TableCell>
              <TableCell align='center' colSpan={1}>
                Amount
              </TableCell>
            </TableRow>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 57, minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                if (row) {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                }
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default Dashboard