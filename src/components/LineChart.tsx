import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';

// #region Sample data
const data = [
  {
    name: 'Page A',
    income: 4000,
    debt: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    income: 3000,
    debt: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    income: 2000,
    debt: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    income: 2780,
    debt: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    income: 1890,
    debt: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    income: 2390,
    debt: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    income: 3490,
    debt: 4300,
    amt: 2100,
  },
];

// #endregion
const LineChartIncome = ({ isAnimationActive = true }) => (
  <LineChart
    style={{ width: '100%', maxWidth: '500px', maxHeight: '70vh', aspectRatio: 1.618 }}
    responsive
    data={data}
    margin={{
      top: 5,
      right: 30,
      left: 20,
      bottom: 5,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis width="auto" />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="debt" name='Borç' stroke="#ff4e4eff" isAnimationActive={isAnimationActive} />
    <Line type="monotone" dataKey="income" name='Gelir' stroke="#82ca9d" isAnimationActive={isAnimationActive} />
  </LineChart>
);

export default LineChartIncome;