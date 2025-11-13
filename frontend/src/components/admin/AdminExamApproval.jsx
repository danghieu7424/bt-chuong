import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"