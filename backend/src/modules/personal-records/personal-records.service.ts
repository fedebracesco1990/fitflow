import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRecord } from './entities/personal-record.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { CheckPRResultDto } from './dto';

@Injectable()
export class PersonalRecordsService {
  private readonly logger = new Logger(PersonalRecordsService.name);

  constructor(
    @InjectRepository(PersonalRecord)
    private readonly personalRecordRepository: Repository<PersonalRecord>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>
  ) {}

  async checkAndUpdatePR(
    userId: string,
    exerciseId: string,
    weight: number | null,
    reps: number
  ): Promise<CheckPRResultDto> {
    if (!weight || weight <= 0 || reps <= 0) {
      return { isNewPR: false, type: null };
    }

    const volume = weight * reps;
    let existingPR = await this.personalRecordRepository.findOne({
      where: { userId, exerciseId },
    });

    let isWeightPR = false;
    let isVolumePR = false;
    const now = new Date();

    if (!existingPR) {
      existingPR = this.personalRecordRepository.create({
        userId,
        exerciseId,
        maxWeight: weight,
        maxWeightReps: reps,
        maxWeightAchievedAt: now,
        maxVolume: volume,
        maxVolumeWeight: weight,
        maxVolumeReps: reps,
        maxVolumeAchievedAt: now,
      });
      await this.personalRecordRepository.save(existingPR);
      isWeightPR = true;
      isVolumePR = true;
    } else {
      if (!existingPR.maxWeight || weight > existingPR.maxWeight) {
        existingPR.maxWeight = weight;
        existingPR.maxWeightReps = reps;
        existingPR.maxWeightAchievedAt = now;
        isWeightPR = true;
      }

      if (!existingPR.maxVolume || volume > existingPR.maxVolume) {
        existingPR.maxVolume = volume;
        existingPR.maxVolumeWeight = weight;
        existingPR.maxVolumeReps = reps;
        existingPR.maxVolumeAchievedAt = now;
        isVolumePR = true;
      }

      if (isWeightPR || isVolumePR) {
        await this.personalRecordRepository.save(existingPR);
      }
    }

    if (!isWeightPR && !isVolumePR) {
      return { isNewPR: false, type: null };
    }

    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });

    let type: 'weight' | 'volume' | 'both';
    if (isWeightPR && isVolumePR) {
      type = 'both';
    } else if (isWeightPR) {
      type = 'weight';
    } else {
      type = 'volume';
    }

    this.logger.log(
      `New PR for user ${userId} on exercise ${exercise?.name}: type=${type}, weight=${weight}, volume=${volume}`
    );

    return {
      isNewPR: true,
      type,
      exerciseName: exercise?.name,
      newWeight: isWeightPR ? weight : undefined,
      newVolume: isVolumePR ? volume : undefined,
    };
  }

  async getUserPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return this.personalRecordRepository.find({
      where: { userId },
      relations: ['exercise'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getPersonalRecordByExercise(
    userId: string,
    exerciseId: string
  ): Promise<PersonalRecord | null> {
    return this.personalRecordRepository.findOne({
      where: { userId, exerciseId },
      relations: ['exercise'],
    });
  }
}
