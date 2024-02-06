'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './TypeAhead.module.css';

interface Film {
  film_id: number;
  film_title: string;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  image_url: string;
  character_names: string[];
  planet_names: string[] | null;
  starship_names: string[] | null;
}


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Debounce hook
function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const TypeAhead = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Film[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      supabase
        .rpc('search_films', { search_term: debouncedSearchTerm })
        .then(({ data, error }) => {
          setIsSearching(false);
          if (error) {
            console.error(error);
            setSearchResults([]);
            return;
          }
          console.log(data);
          setSearchResults(data);
        });
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Type to search..."
        className={styles.searchInput}
      />
      {searchTerm && (
        <div className={styles.searchResults}>
          {isSearching && <div>Searching...</div>}
          {!isSearching && searchResults.length === 0 && debouncedSearchTerm.length > 0 && (
            <div>Nothing found</div>
          )}
          {searchResults.length > 0 && (
            <div className={styles.searchResultCard}>
              {searchResults.map((result, index) => (
                <div key={index} className={styles.filmCard}>
                  <img src={result.image_url} alt={result.film_title} className={styles.filmImage} />
                  <div className={styles.filmTextSection}>
                    <h3 className={styles.filmTitle}>{result.film_title} ({new Date(result.release_date).getFullYear()})</h3>
                    <p className={styles.filmInfo}>Director: {result.director}</p>
                    <p className={styles.filmInfo}>Producer: {result.producer}</p>
                    <p className={styles.filmInfo}>Characters: {result.character_names ? result.character_names.join(', ') : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

};

export default TypeAhead;