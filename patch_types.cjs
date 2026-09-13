const fs = require('fs');
const path = './types.ts';
let content = fs.readFileSync(path, 'utf8');

const oldEnum = `export enum AdvisorCategory {
  INSURANCE = 'Insurance & General',
  REAL_ESTATE = 'Real Estate',
  SECURITIES = 'Securities',
  MORTGAGE = 'Mortgage & Lending',
  LOGISTICS = 'Logistics',
  ADMIN = 'Admin'
}`;

const newEnum = `export enum AdvisorCategory {
  INSURANCE = 'Insurance & General',
  REAL_ESTATE = 'Real Estate',
  SECURITIES = 'Securities',
  MORTGAGE = 'Mortgage & Lending',
  LOGISTICS = 'Logistics',
  GROUP_BENEFITS = 'Group Benefits',
  PROPERTY_CASUALTY = 'Property & Casualty',
  ADMIN = 'Admin'
}`;

content = content.replace(oldEnum, newEnum);
fs.writeFileSync(path, content);
