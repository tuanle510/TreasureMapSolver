import React, { useState } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Typography } from "@mui/material";
import axios from "axios";

export default function Home() {
  const [n, setN] = useState("");
  const [m, setM] = useState("");
  const [p, setP] = useState("");
  const [matrix, setMatrix] = useState([]);
const [fuel, setFuel] = useState(null);

  const handleGenerateMatrixInputs = () => {
    if (n <= 0 || m <= 0 || n > 500 || m > 500) {
      alert("N và M phải từ 1 đến 500");
      return;
    }
    const temp = Array.from({ length: n }, () => Array(m).fill(""));
    setMatrix(temp);
  };

  const handleMatrixChange = (i, j, value) => {
    const temp = [...matrix];
    temp[i][j] = value;
    setMatrix(temp);
  };

  const validateBeforeSubmit = async () => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        const val = parseInt(matrix[i][j]);
        if (isNaN(val) || val < 1 || val > p) {
          alert(`Giá trị tại hàng ${i+1}, cột ${j+1} không hợp lệ`);
          return;
        }
      }
    }
    await submitAsync();
  };

  const submitAsync = async () => {
    try {
      const res = await axios.post("https://localhost:7296/api/Treasure/calculate", {
        N: parseInt(n),
        M: parseInt(m),
        P: parseInt(p),
        Map: matrix
      });
      setFuel(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Nhập thông tin kho báu</Typography>
      
      <TextField label="Số hàng n" type="number" value={n} onChange={e => setN(parseInt(e.target.value))} sx={{ mr: 2 }}/>
      <TextField label="Số cột m" type="number" value={m} onChange={e => setM(parseInt(e.target.value))} sx={{ mr: 2 }}/>
      <TextField label="Số rương p" type="number" value={p} onChange={e => setP(parseInt(e.target.value))} sx={{ mr: 2 }}/>
      <Button variant="contained" onClick={handleGenerateMatrixInputs}>Tạo ma trận</Button>

      {matrix.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                {Array.from({ length: m }).map((_, j) => (
                  <TableCell key={j}>Cột {j+1}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {matrix.map((row, i) => (
                <TableRow key={i}>
                  {row.map((val, j) => (
                    <TableCell key={j}>
                      <TextField 
                        type="number"
                        value={val}
                        onChange={e => handleMatrixChange(i, j, e.target.value)}
                        size="small"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="contained" sx={{ mt: 2 }} onClick={validateBeforeSubmit}>Lưu và Giải</Button>
        </div>
      )}
      {fuel !== null && <div>Minimum Fuel: {fuel}</div>}
    </Container>
  );
}
