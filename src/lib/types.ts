export interface Traits { O: number; C: number; E: number; A: number; N: number }
export interface Profile { id?: string; summary?: string; traits?: Traits }

export interface OnetOccupation {
	soc_code: string;
	title: string;
	version?: string;
}

export interface BaseContext {
	onet?: OnetOccupation;
	first_name?: string;
	name?: string;
	birth_month?: number;
	birth_day?: number;
	birth_year?: number;
	gender?: string;
	culture?: string;
	job_title?: string;
	company?: string;
	skills?: string;
	years_experience?: number;
	education_level?: 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | 'other';
	timezone?: string;
	locale?: string;
	communication_style?: string;
	short_bio?: string;
}

export interface CommunicationScores {
	driver: number;
	analytical: number;
	expressive: number;
	amiable: number;
}

export interface CommunicationModule {
	responses: number[];
	raw_trait_scores: CommunicationScores;
	normalized_trait_scores: CommunicationScores;
	completed: boolean;
	last_updated: string;
}

export interface DeliveryScores {
	def: number;
	peer: number;
	chl: number;
	dns: number;
	aud: number;
	str: number;
	abs: number;
	fmt: number;
	vbs: number;
	emp: number;
	cnd: number;
	hmr: number;
	aut: number;
	bur: number;
}

export interface DeliveryModule {
	responses: number[];
	raw: DeliveryScores;
	normalized: DeliveryScores;
	completed: boolean;
	last_updated: string;
}

// Backwards-compatible aliases
export type LensScores = DeliveryScores;
export type LensModule = DeliveryModule;

export type StateMode = 'convergent' | 'divergent';
export type StateHorizon = 'now' | 'long';
export type StateStakes = 'critical' | 'casual';

export interface StateModule {
	bandwidth: number;
	mode: StateMode;
	horizon: StateHorizon;
	stakes: StateStakes;
	completed?: boolean;
	last_updated?: string;
}
